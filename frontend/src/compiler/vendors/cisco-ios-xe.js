import { normalizeInterfaceName } from './nameExpander';

export const buildIosXeConfig = (state) => {
  const activeDevId = state.devices.activeId;
  const vlans = state.vlans.allIds.map(id => state.vlans.byId[id]).filter(v => v.deviceId === activeDevId);
  const interfaces = state.interfaces.allIds.map(id => state.interfaces.byId[id]).filter(i => i.deviceId === activeDevId);
  const security = state.globalSecurity.byId[activeDevId] || {};
  const globalL2 = state.globalL2.byId[activeDevId] || {};
  const stp = state.stp.byId[activeDevId] || {};

  let cli = `! Generated via NetConfig Pro NOC Edition Compiler (IOS-XE)\n`;
  cli += `enable\nconfigure terminal\n!\n`;

  // Global L2
  cli += `! GLOBAL L2 CONFIGURATION\n`;
  if (globalL2.vtpMode && globalL2.vtpMode !== 'transparent') {
    cli += `vtp mode ${globalL2.vtpMode}\n`;
    if (globalL2.vtpDomain) cli += `vtp domain ${globalL2.vtpDomain}\n`;
    if (globalL2.vtpPassword) cli += `vtp password ${globalL2.vtpPassword}\n`;
    if (globalL2.vtpVersion) cli += `vtp version ${globalL2.vtpVersion}\n`;
  } else {
    cli += `vtp mode transparent\n`;
  }
  if (globalL2.macAging !== undefined && globalL2.macAging !== 300) {
    cli += `mac address-table aging-time ${globalL2.macAging}\n`;
  }
  if (globalL2.errdisableRecovery) {
    cli += `errdisable recovery cause bpduguard\nerrdisable recovery cause psecure-violation\nerrdisable recovery cause udld\n`;
    if (globalL2.errdisableInterval && globalL2.errdisableInterval !== 300) {
      cli += `errdisable recovery interval ${globalL2.errdisableInterval}\n`;
    }
  }
  cli += `!\n`;

  // STP
  cli += `! STP CONFIGURATION\n`;
  if (stp.mode) cli += `spanning-tree mode ${stp.mode}\n`;
  cli += `!\n`;

  // Global Security
  cli += `! GLOBAL SECURITY CONFIGURATION\n`;
  if (security.dhcpSnooping) cli += `ip dhcp snooping\nip dhcp snooping vlan 1-4094\n`;
  if (security.dai) cli += `ip arp inspection vlan 1-4094\n`;
  if (security.bpduGuard) cli += `spanning-tree portfast bpduguard default\n`;
  if (security.loopGuard) cli += `spanning-tree loopguard default\n`;
  cli += `!\n`;

  // VLANs
  cli += `! VLAN CONFIGURATION\n`;
  let rootCli = '';
  vlans.forEach(v => {
    if (v.vlanId) {
      cli += `vlan ${v.vlanId}\n`;
      if (v.name) cli += ` name ${v.name}\n`;
      if (v.stpRoot === 'primary') rootCli += `spanning-tree vlan ${v.vlanId} root primary\n`;
      else if (v.stpRoot === 'secondary') rootCli += `spanning-tree vlan ${v.vlanId} root secondary\n`;
    }
  });
  cli += `!\n` + (rootCli ? rootCli + `!\n` : '');

  // Interfaces
  cli += `! INTERFACE CONFIGURATION\n`;
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

  const generateIntfCommands = (intf) => {
    let out = '';
    if (intf.description) out += ` description ${intf.description}\n`;
    if (intf.mode === 'access') {
      out += ` switchport mode access\n`;
      if (intf.accessVlan) out += ` switchport access vlan ${intf.accessVlan}\n`;
      if (intf.voiceVlan) out += ` switchport voice vlan ${intf.voiceVlan}\n`;
      if (intf.portSecurity) {
        out += ` switchport port-security\n`;
        if (intf.portSecMax > 1) out += ` switchport port-security maximum ${intf.portSecMax}\n`;
        if (intf.portSecViolation && intf.portSecViolation !== 'restrict') out += ` switchport port-security violation ${intf.portSecViolation}\n`;
        if (intf.portSecSticky) out += ` switchport port-security mac-address sticky\n`;
      }
    } else if (intf.mode === 'trunk') {
      out += ` switchport mode trunk\n`;
      if (!intf.dtp) out += ` switchport nonegotiate\n`;
      if (intf.trunkAllowed) out += ` switchport trunk allowed vlan ${intf.trunkAllowed}\n`;
      if (intf.nativeVlan) out += ` switchport trunk native vlan ${intf.nativeVlan}\n`;
    }
    if (intf.portfast) out += ` spanning-tree portfast\n`;
    if (intf.bpduGuard === 'enable') out += ` spanning-tree bpduguard enable\n`;
    else if (intf.bpduGuard === 'disable') out += ` spanning-tree bpduguard disable\n`;
    if (intf.poe === 'never') out += ` power inline never\n`;
    if (intf.udld === 'aggressive') out += ` udld port aggressive\n`;
    else if (intf.udld === 'disable') out += ` udld port disable\n`;
    if (intf.stormControl > 0) out += ` storm-control broadcast level ${intf.stormControl}\n storm-control multicast level ${intf.stormControl}\n`;
    if (intf.ipSourceGuard) out += ` ip verify source\n`;
    if (intf.dhcpSnoopingTrust) out += ` ip dhcp snooping trust\n`;
    if (intf.daiTrust) out += ` ip arp inspection trust\n`;
    return out;
  };

  portChannels.forEach((intf, group) => {
    cli += `interface Port-channel${group}\n`;
    cli += generateIntfCommands(intf);
    if (intf.status === 'disabled') cli += ` shutdown\n`;
    cli += `!\n`;
  });

  uniqueInterfaces.forEach(intf => {
    const normName = normalizeInterfaceName(intf.name, 'IOS-XE');
    cli += `interface ${normName}\n`;
    if (intf.speed && intf.speed !== 'auto') cli += ` speed ${intf.speed}\n`;
    if (intf.duplex && intf.duplex !== 'auto') cli += ` duplex ${intf.duplex}\n`;
    cli += generateIntfCommands(intf);
    if (intf.channelGroup && intf.channelMode) cli += ` channel-group ${intf.channelGroup} mode ${intf.channelMode}\n`;
    if (intf.status === 'disabled') cli += ` shutdown\n`;
    cli += `!\n`;
  });

  cli += `end\nwrite memory\n`;
  return cli;
};
