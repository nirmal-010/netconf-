import { normalizeInterfaceName } from './nameExpander.js';

export const buildJuniperJunos = (state) => {
  const activeDevId = state.devices?.activeId || 'dev-01';
  const vlans = state.vlans?.allIds?.map(id => state.vlans.byId[id]).filter(v => v.deviceId === activeDevId) || [];
  const interfaces = state.interfaces?.allIds?.map(id => state.interfaces.byId[id]).filter(i => i.deviceId === activeDevId) || [];
  const security = state.globalSecurity?.byId?.[activeDevId] || {};
  const globalL2 = state.globalL2?.byId?.[activeDevId] || {};
  const stp = state.stp?.byId?.[activeDevId] || {};

  let cli = `/* Generated via NetConfig Pro Enterprise Compiler (Juniper Junos OS) */\n`;
  cli += `/* Target Platform: Juniper EX/QFX Series Enterprise Switch */\n\n`;
  cli += `configure\n\n`;

  // Sanitize VLAN names to prevent reserved keyword bugs like 'ip' or spaces
  const sanitizeVlanName = (vlan) => {
    let name = vlan.name ? vlan.name.trim().replace(/\s+/g, '_') : `vlan-${vlan.vlanId}`;
    if (!name || name.toLowerCase() === 'ip' || name.toLowerCase() === 'default') {
      name = vlan.vlanId === '99' || vlan.vlanId === '1' ? `MGMT_VLAN_${vlan.vlanId}` : `VLAN_${vlan.vlanId}`;
    }
    return name;
  };

  const vlanIdToName = {};
  vlans.forEach(v => {
    if (v.vlanId) {
      vlanIdToName[v.vlanId] = sanitizeVlanName(v);
    }
  });

  const formatJunosTrunkVlan = (intf) => {
    let out = `                vlan {\n`;
    if (!intf.trunkAllowed || intf.trunkAllowed === '1-4094' || intf.trunkAllowed === 'all') {
      out += `                    members all;\n`;
    } else {
      const allowedIds = new Set(intf.trunkAllowed.split(',').map(s => s.trim()).filter(Boolean));
      if (intf.nativeVlan) allowedIds.add(String(intf.nativeVlan).trim());
      const memberNames = Array.from(allowedIds).map(id => vlanIdToName[id] || `vlan-${id}`);
      out += `                    members [ ${memberNames.join(' ')} ];\n`;
    }
    out += `                }\n`;
    return out;
  };

  // Group Interfaces and LACP Aggregated Ethernet (ae)
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

  // 1. System & Global L2 / Security Parameters (100% hierarchical { } format, no 'set' commands)
  cli += `/* === SWITCHING & SECURITY OPTIONS === */\n`;
  if ((globalL2.macAging && globalL2.macAging !== 300) || globalL2.errdisableRecovery || security.dhcpSnooping || security.dai) {
    cli += `ethernet-switching-options {\n`;
    if (globalL2.macAging && globalL2.macAging !== 300) {
      cli += `    mac-table-aging-time ${globalL2.macAging};\n`;
    }
    if (globalL2.errdisableRecovery) {
      const timeout = globalL2.errdisableInterval || 300;
      cli += `    bpdu-error {\n`;
      cli += `        recovery-timeout ${timeout};\n`;
      cli += `    }\n`;
    }
    if (security.dhcpSnooping || security.dai) {
      cli += `    secure-access-port {\n`;
      // Scope dhcp-snooping and arp-inspection strictly per VLAN (Mistake 2 fix: no global bare commands)
      vlans.forEach(v => {
        if (v.vlanId) {
          const vName = vlanIdToName[v.vlanId];
          cli += `        vlan ${vName} {\n`;
          if (security.dhcpSnooping) cli += `            dhcp-snooping;\n`;
          if (security.dai) cli += `            arp-inspection;\n`;
          cli += `        }\n`;
        }
      });

      // Mistake 1 fix: Trust uplink / trunk interfaces so DHCP server responses aren't dropped
      const trustedInterfaces = [];
      uniqueInterfaces.forEach(intf => {
        const junosName = normalizeInterfaceName(intf.name, intf.number, 'JUNOS');
        const targetLogical = intf.channelGroup ? `ae${intf.channelGroup}.0` : `${junosName}.0`;
        if (intf.mode === 'trunk' || intf.dhcpSnoopingTrust || intf.daiTrust) {
          if (!trustedInterfaces.includes(targetLogical)) {
            trustedInterfaces.push(targetLogical);
          }
        }
      });

      // If no trunk/trusted interfaces were explicitly flagged in UI, ensure uplink is trusted to prevent DHCP breakage
      if (trustedInterfaces.length === 0 && uniqueInterfaces.length > 0) {
        const fallbackUplink = uniqueInterfaces[uniqueInterfaces.length - 1];
        const junosName = normalizeInterfaceName(fallbackUplink.name, fallbackUplink.number, 'JUNOS');
        const fallbackLogical = fallbackUplink.channelGroup ? `ae${fallbackUplink.channelGroup}.0` : `${junosName}.0`;
        trustedInterfaces.push(fallbackLogical);
      }

      trustedInterfaces.forEach(logicalIntf => {
        cli += `        interface ${logicalIntf} {\n`;
        if (security.dhcpSnooping) cli += `            dhcp-trusted;\n`;
        cli += `        }\n`;
      });
      cli += `    }\n`;
    }
    cli += `}\n\n`;
  }

  // 2. VLAN Hierarchy
  cli += `/* === VLAN FABRIC DATABASE === */\n`;
  if (vlans.length > 0) {
    cli += `vlans {\n`;
    vlans.forEach(v => {
      if (v.vlanId) {
        const vlanName = vlanIdToName[v.vlanId];
        cli += `    ${vlanName} {\n`;
        cli += `        vlan-id ${v.vlanId};\n`;
        if (v.description) {
          cli += `        description "${v.description}";\n`;
        }
        cli += `    }\n`;
      }
    });
    cli += `}\n\n`;
  } else {
    cli += `/* No VLANs configured */\n\n`;
  }

  // 3. Interfaces Hierarchy
  cli += `/* === PHYSICAL & LOGICAL INTERFACES === */\n`;
  cli += `interfaces {\n`;

  // First output Aggregated Ethernet (aeX) bundles
  portChannels.forEach((intf, group) => {
    cli += `    ae${group} {\n`;
    if (intf.description) cli += `        description "${intf.description}";\n`;
    cli += `        aggregated-ether-options {\n`;
    cli += `            lacp {\n`;
    cli += `                active;\n`;
    cli += `            }\n`;
    cli += `        }\n`;
    cli += `        unit 0 {\n`;
    cli += `            family ethernet-switching {\n`;
    if (intf.mode === 'access') {
      cli += `                interface-mode access;\n`;
      const targetVlan = vlanIdToName[intf.accessVlan] || `vlan-${intf.accessVlan || '1'}`;
      cli += `                vlan {\n`;
      cli += `                    members ${targetVlan};\n`;
      cli += `                }\n`;
    } else if (intf.mode === 'trunk') {
      cli += `                interface-mode trunk;\n`;
      if (intf.nativeVlan) {
        cli += `                native-vlan-id ${intf.nativeVlan};\n`;
      }
      cli += formatJunosTrunkVlan(intf);
    }
    cli += `            }\n`;
    cli += `        }\n`;
    if (intf.status === 'disabled') {
      cli += `        disable;\n`;
    }
    cli += `    }\n`;
  });

  // Output physical interfaces
  uniqueInterfaces.forEach(intf => {
    const junosName = normalizeInterfaceName(intf.name, intf.number, 'JUNOS');
    cli += `    ${junosName} {\n`;
    if (intf.description) cli += `        description "${intf.description}";\n`;
    if (intf.speed && intf.speed !== 'auto') {
      cli += `        speed ${intf.speed};\n`;
    }
    if (intf.channelGroup && intf.channelMode) {
      cli += `        ether-options {\n`;
      cli += `            802.3ad ae${intf.channelGroup};\n`;
      cli += `        }\n`;
    } else {
      cli += `        unit 0 {\n`;
      cli += `            family ethernet-switching {\n`;
      if (intf.mode === 'access') {
        cli += `                interface-mode access;\n`;
        const targetVlan = vlanIdToName[intf.accessVlan] || `vlan-${intf.accessVlan || '1'}`;
        cli += `                vlan {\n`;
        cli += `                    members ${targetVlan};\n`;
        cli += `                }\n`;
      } else if (intf.mode === 'trunk') {
        cli += `                interface-mode trunk;\n`;
        if (intf.nativeVlan) {
          cli += `                native-vlan-id ${intf.nativeVlan};\n`;
        }
        cli += formatJunosTrunkVlan(intf);
      }
      cli += `            }\n`;
      cli += `        }\n`;
    }

    if (intf.status === 'disabled') {
      cli += `        disable;\n`;
    }
    cli += `    }\n`;
  });
  cli += `}\n\n`;

  // 4. Protocols & Spanning Tree (RSTP / MSTP / Portfast / BPDU Guard)
  cli += `/* === SPANNING TREE PROTOCOL (STP) === */\n`;
  const stpMode = stp.mode === 'mst' ? 'mstp' : 'rstp';
  if (stp.mode !== 'none') {
    cli += `protocols {\n`;
    cli += `    ${stpMode} {\n`;
    if (security.bpduGuard) {
      cli += `        bpdu-block-on-edge;\n`;
    }
    vlans.forEach(v => {
      if (v.stpRoot === 'primary') {
        cli += `        bridge-priority 4096; /* Primary root for ${vlanIdToName[v.vlanId] || v.vlanId} */\n`;
      } else if (v.stpRoot === 'secondary') {
        cli += `        bridge-priority 16384; /* Secondary root for ${vlanIdToName[v.vlanId] || v.vlanId} */\n`;
      }
    });

    uniqueInterfaces.forEach(intf => {
      if (intf.portfast || intf.bpduGuard === 'enable') {
        const junosName = normalizeInterfaceName(intf.name, intf.number, 'JUNOS');
        cli += `        interface ${junosName} {\n`;
        if (intf.portfast) cli += `            edge;\n`;
        if (intf.bpduGuard === 'enable') cli += `            bpdu-block;\n`;
        if (intf.bpduGuard === 'disable') cli += `            no-bpdu-block;\n`;
        cli += `        }\n`;
      }
    });
    cli += `    }\n`;
    cli += `}\n\n`;
  } else {
    cli += `/* Spanning Tree is disabled on this switch profile */\n\n`;
  }

  // 5. Check for unsupported platform features (Rule 5)
  if (globalL2.vtpMode && globalL2.vtpMode !== 'transparent' && globalL2.vtpMode !== 'off') {
    cli += `/* ! VTP (VLAN Trunking Protocol) is a Cisco proprietary feature not supported on Juniper Junos */\n`;
  }
  if (interfaces.some(i => i.portSecurity || i.portSecSticky)) {
    cli += `/* ! Port-Security sticky MAC syntax uses Junos MAC limit / storm-control policies under switch-options */\n`;
  }

  cli += `/* === COMMIT AND VERIFICATION === */\n`;
  cli += `commit check\n`;
  cli += `commit comment "Deployed via NetConfig Pro Multi-Vendor Automation Engine"\n`;

  return cli;
};
