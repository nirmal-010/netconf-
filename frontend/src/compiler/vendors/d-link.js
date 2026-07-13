import { normalizeInterfaceName } from './nameExpander.js';

export const buildDLink = (state) => {
  const activeDevId = state.devices?.activeId || 'dev-01';
  const vlans = state.vlans?.allIds?.map(id => state.vlans.byId[id]).filter(v => v.deviceId === activeDevId) || [];
  const interfaces = state.interfaces?.allIds?.map(id => state.interfaces.byId[id]).filter(i => i.deviceId === activeDevId) || [];
  const security = state.globalSecurity?.byId?.[activeDevId] || {};
  const globalL2 = state.globalL2?.byId?.[activeDevId] || {};
  const stp = state.stp?.byId?.[activeDevId] || {};

  let cli = `# Generated via NetConfig Pro Enterprise Compiler (D-Link DGS/DXS Series)\n`;
  cli += `# Target Platform: D-Link Enterprise Managed L2/L3 Switch\n\n`;
  cli += `disable clipaging\n#\n`;

  // 1. System & Global L2 Security
  cli += `# === GLOBAL SWITCH PROPERTIES ===\n`;
  if (globalL2.macAging && globalL2.macAging !== 300) {
    cli += `config fdb aging_time ${globalL2.macAging}\n`;
  }
  if (security.dhcpSnooping) {
    cli += `# DHCP Snooping Policy (Global & Per-VLAN Enable)\n`;
    cli += `enable dhcp_snooping\n`;
    vlans.forEach(v => {
      const vlanName = v.name ? v.name.replace(/\s+/g, '_') : `vlan${v.vlanId}`;
      if (v.vlanId) cli += `config dhcp_snooping vlan_name ${vlanName} state enable\n`;
    });
  }
  if (security.dai) {
    cli += `# Dynamic ARP Inspection Equivalent (IP-MAC Address Binding via DHCP Snoop)\n`;
    cli += `enable address_binding dhcp_snoop\n`;
  }
  cli += `#\n`;

  // 2. Link Aggregation (LACP Groups)
  cli += `# === LINK AGGREGATION (LACP) ===\n`;
  const portChannels = new Map();
  const seenInterfaces = new Set();
  const uniqueInterfaces = [];

  for (let i = interfaces.length - 1; i >= 0; i--) {
    const intf = interfaces[i];
    if (intf.name && !seenInterfaces.has(intf.name)) {
      seenInterfaces.add(intf.name);
      uniqueInterfaces.unshift(intf);
    }
  }

  uniqueInterfaces.forEach(intf => {
    if (intf.channelGroup && intf.channelMode) {
      if (!portChannels.has(intf.channelGroup)) portChannels.set(intf.channelGroup, intf);
    }
  });

  if (portChannels.size > 0) {
    portChannels.forEach((intf, group) => {
      cli += `create link_aggregation group_id ${group} type lacp\n`;
    });
  } else {
    cli += `# No Link Aggregation (LACP) groups currently defined on this device\n`;
  }
  cli += `#\n`;

  // 3. Physical Port Configuration & PVID Assignments (Rule 2 D-Link syntax)
  cli += `# === PORT CONFIGURATION & PVID ===\n`;
  uniqueInterfaces.forEach(intf => {
    const portNum = normalizeInterfaceName(intf.name, intf.number, 'D-Link');
    if (intf.description) {
      cli += `config ports ${portNum} description "${intf.description}"\n`;
    }
    if (intf.speed && intf.speed !== 'auto') {
      cli += `config ports ${portNum} speed ${intf.speed}\n`;
    }
    if (intf.status === 'disabled') {
      cli += `config ports ${portNum} state disable\n`;
    } else {
      cli += `config ports ${portNum} state enable\n`;
    }

    if (intf.mode === 'access') {
      const pvid = intf.accessVlan || '1';
      cli += `config ports ${portNum} pvid ${pvid}\n`;
    } else if (intf.mode === 'trunk') {
      const nativeVid = intf.nativeVlan || '1';
      cli += `config ports ${portNum} pvid ${nativeVid}\n`;
    }

    if (intf.channelGroup && intf.channelMode) {
      cli += `config link_aggregation group_id ${intf.channelGroup} add ports ${portNum}\n`;
    }
    if (intf.stormControl > 0) {
      cli += `# Note: Verify traffic_control threshold unit (pps vs kbps vs 64-kbps chunks) with 'config traffic_control ?' against switch firmware revision\n`;
      cli += `config traffic_control ${portNum} broadcast enable threshold ${intf.stormControl}\n`;
    }
    if (security.dhcpSnooping && (intf.dhcpSnoopingTrust || intf.mode === 'trunk')) {
      cli += `# Note: Verify 'trust' vs 'untrust' keyword with 'config dhcp_snooping ports ?' if needed\n`;
      cli += `config dhcp_snooping ports ${portNum} state enable trust\n`;
    }
    if (security.dai && (intf.daiTrust || intf.mode === 'trunk')) {
      cli += `config address_binding dhcp_snoop ports ${portNum} state enable\n`;
    }
  });
  cli += `#\n`;

  // 4. VLAN Creation & Port Membership (Rule 2: config vlan HR add untagged 1)
  cli += `# === VLAN DATABASE & PORT MEMBERSHIP ===\n`;
  vlans.forEach(v => {
    if (v.vlanId) {
      const vlanName = v.name ? v.name.replace(/\s+/g, '_') : `vlan${v.vlanId}`;
      cli += `create vlan ${vlanName} vlanid ${v.vlanId}\n`;
      if (v.description) {
        cli += `# Description: ${v.description}\n`;
      }
    }
  });
  cli += `#\n`;

  vlans.forEach(v => {
    if (v.vlanId) {
      const vlanName = v.name ? v.name.replace(/\s+/g, '_') : `vlan${v.vlanId}`;
      const untaggedPorts = [];
      const taggedPorts = [];

      uniqueInterfaces.forEach(intf => {
        const portNum = normalizeInterfaceName(intf.name, intf.number, 'D-Link');
        if (intf.mode === 'access') {
          if (String(intf.accessVlan) === String(v.vlanId)) {
            untaggedPorts.push(portNum);
          }
        } else if (intf.mode === 'trunk') {
          if (String(intf.nativeVlan) === String(v.vlanId)) {
            untaggedPorts.push(portNum);
          } else if (!intf.trunkAllowed || intf.trunkAllowed === 'all' || intf.trunkAllowed === '1-4094') {
            taggedPorts.push(portNum);
          } else {
            const allowed = intf.trunkAllowed.split(',').map(s => s.trim());
            if (allowed.includes(String(v.vlanId))) {
              taggedPorts.push(portNum);
            }
          }
        }
      });

      if (untaggedPorts.length > 0) {
        cli += `config vlan ${vlanName} add untagged ${untaggedPorts.join(',')}\n`;
      }
      if (taggedPorts.length > 0) {
        cli += `config vlan ${vlanName} add tagged ${taggedPorts.join(',')}\n`;
      }
    }
  });
  cli += `#\n`;

  // 5. Spanning Tree Protocol
  cli += `# === SPANNING TREE PROTOCOL ===\n`;
  if (stp.mode !== 'none') {
    const stpVer = stp.mode === 'mst' ? 'mstp' : 'rstp';
    cli += `config stp version ${stpVer}\n`;
    cli += `enable stp\n`;

    vlans.forEach(v => {
      if (v.vlanId) {
        if (v.stpRoot === 'primary') {
          cli += `config stp priority 4096 instance_id 0\n`;
        } else if (v.stpRoot === 'secondary') {
          cli += `config stp priority 16384 instance_id 0\n`;
        }
      }
    });

    uniqueInterfaces.forEach(intf => {
      const portNum = normalizeInterfaceName(intf.name, intf.number, 'D-Link');
      if (intf.portfast) {
        cli += `config stp ports ${portNum} edge true\n`;
      }
      if (intf.bpduGuard === 'enable') {
        cli += `config stp ports ${portNum} fbpdu enable\n`;
      }
    });
  } else {
    cli += `disable stp\n`;
  }
  cli += `#\n`;

  // 6. Check unsupported Cisco features
  if (globalL2.vtpMode && globalL2.vtpMode !== 'transparent' && globalL2.vtpMode !== 'off') {
    cli += `# ! Feature not supported on this platform (VTP is Cisco proprietary)\n`;
  }

  cli += `# === SAVE CONFIGURATION ===\n`;
  cli += `save\n`;

  return cli;
};
