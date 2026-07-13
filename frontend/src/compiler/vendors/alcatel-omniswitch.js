import { normalizeInterfaceName } from './nameExpander.js';

export const buildAlcatelOmniSwitch = (state) => {
  const activeDevId = state.devices?.activeId || 'dev-01';
  const vlans = state.vlans?.allIds?.map(id => state.vlans.byId[id]).filter(v => v.deviceId === activeDevId) || [];
  const interfaces = state.interfaces?.allIds?.map(id => state.interfaces.byId[id]).filter(i => i.deviceId === activeDevId) || [];
  const security = state.globalSecurity?.byId?.[activeDevId] || {};
  const globalL2 = state.globalL2?.byId?.[activeDevId] || {};
  const stp = state.stp?.byId?.[activeDevId] || {};

  let cli = `! Generated via NetConfig Pro Enterprise Compiler (Alcatel-Lucent OmniSwitch AOS)\n`;
  cli += `! Target Platform: Alcatel-Lucent Enterprise OmniSwitch 6860E/6900 Series\n\n`;
  cli += `configure system\n!\n`;

  // 1. Global L2 & Security
  cli += `! === GLOBAL SWITCH & MAC CONFIGURATION ===\n`;
  if (globalL2.macAging && globalL2.macAging !== 300) {
    cli += `mac-address-table aging-time ${globalL2.macAging}\n`;
  }
  if (security.dhcpSnooping) {
    cli += `! DHCP Snooping Policy (AOS 8 Native - Do not conflate with ip helper relay)\n`;
    cli += `dhcp-snooping admin-state enable\n`;
    if (vlans.length > 0) {
      vlans.forEach(v => {
        if (v.vlanId) cli += `dhcp-snooping vlan ${v.vlanId} enable\n`;
      });
    } else {
      cli += `dhcp-snooping vlan 1-4094 enable\n`;
    }
  }
  if (security.dai) {
    cli += `! Dynamic ARP Inspection (VLAN Scoped - Never bare global)\n`;
    if (vlans.length > 0) {
      vlans.forEach(v => {
        if (v.vlanId) cli += `arp-inspection vlan ${v.vlanId} enable\n`;
      });
    } else {
      cli += `arp-inspection vlan 1-4094 enable\n`;
    }
  }
  cli += `!\n`;

  // 2. Link Aggregation (LACP) Groups
  cli += `! === LINK AGGREGATION (LACP) GROUPS ===\n`;
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
      cli += `linkagg agg ${group} size 8 name "AGG-${group}" actor admin-state enable\n`;
      if (intf.description) {
        cli += `linkagg agg ${group} description "${intf.description}"\n`;
      }
    });
  } else {
    cli += `! No Link Aggregation (LACP) groups currently defined on this device\n`;
  }
  cli += `!\n`;

  // 3. Physical Interfaces Configuration
  cli += `! === PHYSICAL INTERFACES & ALIASES ===\n`;
  uniqueInterfaces.forEach(intf => {
    const aosPort = normalizeInterfaceName(intf.name, intf.number, 'AOS');
    if (intf.description) {
      cli += `interfaces ${aosPort} alias "${intf.description}"\n`;
    }
    if (intf.speed && intf.speed !== 'auto') {
      cli += `interfaces ${aosPort} speed ${intf.speed}\n`;
    }
    if (intf.status === 'disabled') {
      cli += `interfaces ${aosPort} admin-state disable\n`;
    } else {
      cli += `interfaces ${aosPort} admin-state enable\n`;
    }
    if (intf.channelGroup && intf.channelMode) {
      cli += `linkagg port ${aosPort} agg ${intf.channelGroup}\n`;
    }
    if (intf.stormControl > 0) {
      cli += `! Note: Verify exact broadcast storm threshold keyword ('bcast-storm threshold' vs 'bcast-storm-recovery') against switch firmware revision\n`;
      cli += `interfaces ${aosPort} bcast-storm threshold ${intf.stormControl}\n`;
    }
    if (security.dhcpSnooping && (intf.dhcpSnoopingTrust || intf.mode === 'trunk')) {
      cli += `dhcp-snooping port ${aosPort} trust\n`;
    }
    if (security.dai && (intf.daiTrust || intf.mode === 'trunk')) {
      cli += `arp-inspection port ${aosPort} trust\n`;
    }
    if (intf.udld && intf.udld !== 'disable') {
      cli += `interfaces ${aosPort} udld admin-state enable\n`;
    }
  });
  cli += `!\n`;

  // 4. VLAN Creation & Port Membership (Rule 2 AOS syntax)
  cli += `! === VLAN CREATION & PORT MEMBERSHIP ===\n`;
  vlans.forEach(v => {
    if (v.vlanId) {
      cli += `vlan ${v.vlanId} enable\n`;
      if (v.name) {
        cli += `vlan ${v.vlanId} name "${v.name}"\n`;
      }
      if (v.description) {
        cli += `vlan ${v.vlanId} description "${v.description}"\n`;
      }
    }
  });
  cli += `!\n`;

  // Assign untagged and tagged members per interface
  uniqueInterfaces.forEach(intf => {
    const aosPort = normalizeInterfaceName(intf.name, intf.number, 'AOS');
    const targetPort = (intf.channelGroup && intf.channelMode) ? `linkagg ${intf.channelGroup}` : `port ${aosPort}`;

    if (intf.mode === 'access') {
      const vlanId = intf.accessVlan || '1';
      cli += `vlan ${vlanId} members ${targetPort} untagged\n`;
      if (intf.voiceVlan) {
        cli += `vlan ${intf.voiceVlan} members ${targetPort} tagged\n`;
      }
    } else if (intf.mode === 'trunk') {
      if (intf.nativeVlan) {
        cli += `vlan ${intf.nativeVlan} members ${targetPort} untagged\n`;
      }
      if (intf.trunkAllowed) {
        if (intf.trunkAllowed === '1-4094' || intf.trunkAllowed === 'all') {
          vlans.forEach(v => {
            if (v.vlanId && v.vlanId !== intf.nativeVlan) {
              cli += `vlan ${v.vlanId} members ${targetPort} tagged\n`;
            }
          });
        } else {
          const allowedVlans = intf.trunkAllowed.split(',').map(s => s.trim());
          allowedVlans.forEach(vid => {
            if (vid !== intf.nativeVlan) {
              cli += `vlan ${vid} members ${targetPort} tagged\n`;
            }
          });
        }
      } else {
        vlans.forEach(v => {
          if (v.vlanId && v.vlanId !== intf.nativeVlan) {
            cli += `vlan ${v.vlanId} members ${targetPort} tagged\n`;
          }
        });
      }
    }
  });
  cli += `!\n`;

  // 5. Spanning Tree Policy (AOS 1x1 Spantree)
  cli += `! === SPANNING TREE PROTOCOL ===\n`;
  if (stp.mode !== 'none') {
    const mode = stp.mode === 'mst' ? 'flat' : '1x1';
    cli += `spantree mode ${mode}\n`;
    cli += `spantree cist admin-state enable\n`;

    vlans.forEach(v => {
      if (v.vlanId) {
        if (v.stpRoot === 'primary') {
          cli += `spantree vlan ${v.vlanId} priority 4096\n`;
        } else if (v.stpRoot === 'secondary') {
          cli += `spantree vlan ${v.vlanId} priority 16384\n`;
        }
      }
    });

    uniqueInterfaces.forEach(intf => {
      const aosPort = normalizeInterfaceName(intf.name, intf.number, 'AOS');
      if (intf.portfast || intf.bpduGuard === 'enable') {
        cli += `spantree port ${aosPort} admin-edge enable\n`;
        if (intf.bpduGuard === 'enable') {
          cli += `spantree port ${aosPort} bpdu-guard enable\n`;
        }
      }
    });
  } else {
    cli += `spantree cist admin-state disable\n`;
  }
  cli += `!\n`;

  // 6. Check unsupported Cisco proprietary features
  if (globalL2.vtpMode && globalL2.vtpMode !== 'transparent' && globalL2.vtpMode !== 'off') {
    cli += `! Feature not supported on this platform (VTP is Cisco proprietary)\n`;
  }

  cli += `! === TWO-STAGE CONFIGURATION PERSISTENCE (AOS Release 8) ===\n`;
  cli += `! Stage 1: Save active configuration changes to working directory\n`;
  cli += `copy running-config working\n`;
  cli += `! Stage 2: Certify working configuration to survive chassis reboots\n`;
  cli += `! Note: Comment out Stage 2 if staging/testing before certifying:\n`;
  cli += `copy working certified\n`;

  return cli;
};
