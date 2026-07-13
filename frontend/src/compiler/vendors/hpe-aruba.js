import { normalizeInterfaceName } from './nameExpander.js';

export const buildAOSCX = (state) => {
  const activeDevId = state.devices?.activeId || 'dev-01';
  const vlans = state.vlans?.allIds?.map(id => state.vlans.byId[id]).filter(v => v.deviceId === activeDevId) || [];
  const interfaces = state.interfaces?.allIds?.map(id => state.interfaces.byId[id]).filter(i => i.deviceId === activeDevId) || [];
  const security = state.globalSecurity?.byId?.[activeDevId] || {};
  const globalL2 = state.globalL2?.byId?.[activeDevId] || {};
  const stp = state.stp?.byId?.[activeDevId] || {};

  let cli = `! HPE Aruba AOS-CX Enterprise Configuration\n`;
  cli += `! Target Platform: HPE Aruba CX 6200/6300/6400 Enterprise Campus Switch\n\n`;
  cli += `configure terminal\n!\n`;

  // 1. STP Settings
  cli += `! === SPANNING TREE PROTOCOL ===\n`;
  if (stp && stp.mode !== 'none') {
    const modeMap = {
      'rapid-pvst': 'rpvst',
      'mst': 'mstp'
    };
    cli += `spanning-tree mode ${modeMap[stp.mode] || 'mstp'}\n`;
    cli += `spanning-tree\n`;
  } else {
    cli += `no spanning-tree\n`;
  }
  cli += `!\n`;

  // 2. Global Security & Snooping
  cli += `! === GLOBAL SECURITY & FABRIC SNOOPING ===\n`;
  if (security) {
    if (security.dhcpSnooping) {
      cli += `dhcp-snooping\n`;
      if (vlans.length > 0) cli += `dhcp-snooping vlan 1-4094\n`;
    }
    if (security.dai) {
      cli += `arp-inspect\n`;
      if (vlans.length > 0) cli += `arp-inspect vlan 1-4094\n`;
    }
  }
  if (globalL2.vtpMode && globalL2.vtpMode !== 'transparent' && globalL2.vtpMode !== 'off') {
    cli += `! Feature not supported on this platform (VTP is Cisco proprietary)\n`;
  }
  cli += `!\n`;

  // 3. VLANs
  cli += `! === VLAN FABRIC DATABASE ===\n`;
  vlans.forEach(vlan => {
    if (vlan.vlanId) {
      cli += `vlan ${vlan.vlanId}\n`;
      if (vlan.name) cli += `    name ${vlan.name}\n`;
      if (vlan.description) cli += `    ! Description: ${vlan.description}\n`;
    }
  });
  cli += `!\n`;

  // 4. Interfaces & LAGs
  cli += `! === LINK AGGREGATION GROUPS (LAG) ===\n`;
  const etherChannels = {};
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
      if (!etherChannels[intf.channelGroup]) {
        etherChannels[intf.channelGroup] = [];
      }
      etherChannels[intf.channelGroup].push(intf);
    }
  });

  Object.keys(etherChannels).forEach(groupId => {
    const primaryIntf = etherChannels[groupId][0];
    cli += `interface lag ${groupId}\n`;
    if (primaryIntf.description) cli += `    description "${primaryIntf.description}"\n`;
    cli += `    no routing\n`;
    
    if (primaryIntf.mode === 'trunk') {
      cli += `    vlan trunk allowed ${primaryIntf.trunkAllowed || 'all'}\n`;
      if (primaryIntf.nativeVlan && primaryIntf.nativeVlan !== '1') cli += `    vlan trunk native ${primaryIntf.nativeVlan}\n`;
    } else {
      cli += `    vlan access ${primaryIntf.accessVlan || '1'}\n`;
    }
    cli += `!\n`;
  });

  cli += `! === PHYSICAL INTERFACES ===\n`;
  uniqueInterfaces.forEach(intf => {
    const interfaceName = normalizeInterfaceName(intf.name, intf.number, 'AOS-CX');
    cli += `interface ${interfaceName}\n`;
    if (intf.description) cli += `    description "${intf.description}"\n`;
    if (intf.speed && intf.speed !== 'auto') cli += `    speed ${intf.speed}\n`;
    
    if (intf.status === 'disabled') cli += `    shutdown\n`;
    else cli += `    no shutdown\n`;

    if (security?.dhcpSnooping && intf.dhcpSnoopingTrust) {
      cli += `    dhcp-snooping trust\n`;
    }
    if (security?.dai && intf.daiTrust) {
      cli += `    arp-inspect trust\n`;
    }

    if (intf.channelGroup && intf.channelMode) {
      cli += `    lag ${intf.channelGroup}\n`;
      cli += `!\n`;
      return;
    }

    cli += `    no routing\n`;
    
    if (intf.mode === 'trunk') {
      cli += `    vlan trunk allowed ${intf.trunkAllowed || 'all'}\n`;
      if (intf.nativeVlan && intf.nativeVlan !== '1') cli += `    vlan trunk native ${intf.nativeVlan}\n`;
    } else {
      cli += `    vlan access ${intf.accessVlan || '1'}\n`;
      
      if (intf.portfast) cli += `    spanning-tree port-type admin-edge\n`;
      if (intf.bpduGuard === 'enable') cli += `    spanning-tree bpdu-guard\n`;

      if (intf.portSecurity) {
        cli += `    port-access port-security\n`;
        if (intf.portSecMax) cli += `    port-access port-security client-limit ${intf.portSecMax}\n`;
      }
    }
    cli += `!\n`;
  });

  cli += `! === COMMIT & SAVE CONFIGURATION ===\n`;
  cli += `end\n`;
  cli += `write memory\n`;

  return cli;
};
