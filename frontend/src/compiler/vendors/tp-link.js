import { normalizeInterfaceName } from './nameExpander.js';

export const buildTPLink = (state) => {
  const activeDevId = state.devices?.activeId || 'dev-01';
  const vlans = state.vlans?.allIds?.map(id => state.vlans.byId[id]).filter(v => v.deviceId === activeDevId) || [];
  const interfaces = state.interfaces?.allIds?.map(id => state.interfaces.byId[id]).filter(i => i.deviceId === activeDevId) || [];
  const security = state.globalSecurity?.byId?.[activeDevId] || {};
  const globalL2 = state.globalL2?.byId?.[activeDevId] || {};
  const stp = state.stp?.byId?.[activeDevId] || {};

  let cli = `! TP-Link JetStream Enterprise Configuration\n`;
  cli += `! Target Platform: TP-Link JetStream T3700/T2600G Managed Switch\n\n`;
  cli += `enable\nconfigure\n!\n`;

  // 1. Global L2 & STP Settings
  cli += `! === GLOBAL SWITCH & SPANNING TREE PROTOCOL ===\n`;
  if (stp && stp.mode !== 'none') {
    cli += `spanning-tree\n`;
    const mode = stp.mode === 'mst' ? 'mstp' : 'rstp';
    cli += `spanning-tree mode ${mode}\n`;
  } else {
    cli += `no spanning-tree\n`;
  }

  if (globalL2.macAging && globalL2.macAging !== 300) {
    cli += `mac address-table aging-time ${globalL2.macAging}\n`;
  }
  cli += `!\n`;

  // 2. Global Security
  cli += `! === GLOBAL SECURITY & SNOOPING ===\n`;
  if (security.dhcpSnooping) {
    cli += `ip dhcp snooping\n`;
    if (vlans.length > 0) cli += `ip dhcp snooping vlan 1-4094\n`;
  }
  if (security.dai) {
    cli += `ip arp inspection vlan 1-4094\n`;
  }
  if (globalL2.vtpMode && globalL2.vtpMode !== 'transparent' && globalL2.vtpMode !== 'off') {
    cli += `! Feature not supported on this platform (VTP is Cisco proprietary)\n`;
  }
  cli += `!\n`;

  // 3. VLANs
  cli += `! === VLAN DATABASE ===\n`;
  vlans.forEach(vlan => {
    if (vlan.vlanId) {
      cli += `vlan ${vlan.vlanId}\n`;
      if (vlan.name) cli += `  name "${vlan.name}"\n`;
      if (vlan.description) cli += `  ! Description: ${vlan.description}\n`;
      cli += `!\n`;
    }
  });

  // 4. Interfaces & Link Aggregation
  cli += `! === LINK AGGREGATION GROUPS ===\n`;
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
    cli += `interface port-channel ${groupId}\n`;
    if (primaryIntf.description) cli += `  description "${primaryIntf.description}"\n`;
    
    if (primaryIntf.mode === 'trunk') {
      cli += `  switchport mode trunk\n`;
      if (primaryIntf.trunkAllowed) cli += `  switchport trunk allowed vlan ${primaryIntf.trunkAllowed}\n`;
      if (primaryIntf.nativeVlan && primaryIntf.nativeVlan !== '1') cli += `  switchport trunk native vlan ${primaryIntf.nativeVlan}\n`;
    } else {
      cli += `  switchport mode access\n`;
      if (primaryIntf.accessVlan) cli += `  switchport access vlan ${primaryIntf.accessVlan}\n`;
    }
    cli += `!\n`;
  });

  cli += `! === PHYSICAL INTERFACES ===\n`;
  uniqueInterfaces.forEach(intf => {
    const interfaceName = normalizeInterfaceName(intf.name, intf.number, 'JetStream');
    cli += `interface ${interfaceName}\n`;
    if (intf.description) cli += `  description "${intf.description}"\n`;
    if (intf.speed && intf.speed !== 'auto') cli += `  speed ${intf.speed}\n`;
    
    if (intf.status === 'disabled') cli += `  shutdown\n`;
    else cli += `  no shutdown\n`;

    if (security?.dhcpSnooping && intf.dhcpSnoopingTrust) {
      cli += `  ip dhcp snooping trust\n`;
    }
    if (security?.dai && intf.daiTrust) {
      cli += `  ip arp inspection trust\n`;
    }

    if (intf.channelGroup && intf.channelMode) {
      const mode = intf.channelMode ? `mode ${intf.channelMode}` : 'mode active';
      cli += `  channel-group ${intf.channelGroup} ${mode}\n`;
      cli += `!\n`;
      return;
    }
    
    if (intf.mode === 'trunk') {
      cli += `  switchport general allowed vlan ${intf.trunkAllowed || '1-4094'} tagged\n`;
      if (intf.nativeVlan && intf.nativeVlan !== '1') {
        cli += `  switchport general allowed vlan ${intf.nativeVlan} untagged\n`;
        cli += `  switchport pvid ${intf.nativeVlan}\n`;
      }
    } else {
      cli += `  switchport mode access\n`;
      if (intf.accessVlan) cli += `  switchport access vlan ${intf.accessVlan}\n`;
      
      if (intf.portfast) cli += `  spanning-tree portfast\n`;
      if (intf.bpduGuard === 'enable') cli += `  spanning-tree bpduguard enable\n`;

      if (intf.portSecurity) {
        cli += `  switchport port-security\n`;
        if (intf.portSecMax) cli += `  switchport port-security maximum ${intf.portSecMax}\n`;
      }
    }
    cli += `!\n`;
  });

  cli += `! === SAVE & COMMIT ===\n`;
  cli += `end\n`;
  cli += `copy running-config startup-config\n`;

  return cli;
};
