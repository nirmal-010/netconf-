export const generateGlobalL2Config = (globalL2) => {
  if (!globalL2) return '';
  let cli = `! GLOBAL L2 CONFIGURATION\n`;
  
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
    cli += `errdisable recovery cause bpduguard\n`;
    cli += `errdisable recovery cause psecure-violation\n`;
    cli += `errdisable recovery cause udld\n`;
    if (globalL2.errdisableInterval && globalL2.errdisableInterval !== 300) {
      cli += `errdisable recovery interval ${globalL2.errdisableInterval}\n`;
    }
  }

  return cli + `!\n`;
};

export const generateVlanConfig = (vlans) => {
  if (!vlans || vlans.length === 0 || !vlans.some(v => v.vlanId)) return '';
  let cli = `! VLAN CONFIGURATION\n`;
  let rootCli = '';
  vlans.forEach(v => {
    if (v.vlanId) {
      cli += `vlan ${v.vlanId}\n`;
      if (v.name) cli += ` name ${v.name}\n`;
      if (v.stpRoot === 'primary') rootCli += `spanning-tree vlan ${v.vlanId} root primary\n`;
      else if (v.stpRoot === 'secondary') rootCli += `spanning-tree vlan ${v.vlanId} root secondary\n`;
    }
  });
  return cli + `!\n` + (rootCli ? rootCli + `!\n` : '');
};

export const generateStpConfig = (stp) => {
  let cli = `! STP CONFIGURATION\n`;
  if (stp && stp.mode) {
    cli += `spanning-tree mode ${stp.mode}\n`;
  }
  return cli + `!\n`;
};

export const generateSecurityConfig = (security) => {
  let cli = `! SECURITY CONFIGURATION\n`;
  if (security.dhcpSnooping) {
    cli += `ip dhcp snooping\nip dhcp snooping vlan 1-4094\n`;
  }
  if (security.dai) {
    cli += `ip arp inspection vlan 1-4094\n`;
  }
  if (security.bpduGuard) {
    cli += `spanning-tree portfast bpduguard default\n`;
  }
  if (security.rootGuard) {
    cli += `! Root guard is enabled per-interface usually, added here as a global note\n`;
  }
  if (security.loopGuard) {
    cli += `spanning-tree loopguard default\n`;
  }
  return cli + `!\n`;
};

const getInterfaceSettings = (intf) => {
  let cli = '';
  if (intf.description) cli += ` description ${intf.description}\n`;
  
  if (intf.mode === 'access') {
    cli += ` switchport mode access\n`;
    if (intf.accessVlan) cli += ` switchport access vlan ${intf.accessVlan}\n`;
    if (intf.voiceVlan) cli += ` switchport voice vlan ${intf.voiceVlan}\n`;
    
    if (intf.portSecurity) {
      cli += ` switchport port-security\n`;
      if (intf.portSecMax > 1) cli += ` switchport port-security maximum ${intf.portSecMax}\n`;
      if (intf.portSecViolation && intf.portSecViolation !== 'restrict') cli += ` switchport port-security violation ${intf.portSecViolation}\n`;
      if (intf.portSecSticky) cli += ` switchport port-security mac-address sticky\n`;
    }
  } else if (intf.mode === 'trunk') {
    cli += ` switchport mode trunk\n`;
    if (!intf.dtp) cli += ` switchport nonegotiate\n`;
    if (intf.trunkAllowed) cli += ` switchport trunk allowed vlan ${intf.trunkAllowed}\n`;
    if (intf.nativeVlan) cli += ` switchport trunk native vlan ${intf.nativeVlan}\n`;
  }

  // Advanced STP per interface
  if (intf.portfast) cli += ` spanning-tree portfast\n`;
  if (intf.bpduGuard === 'enable') cli += ` spanning-tree bpduguard enable\n`;
  else if (intf.bpduGuard === 'disable') cli += ` spanning-tree bpduguard disable\n`;

  // PoE & UDLD
  if (intf.poe === 'never') cli += ` power inline never\n`;
  if (intf.udld === 'aggressive') cli += ` udld port aggressive\n`;
  else if (intf.udld === 'disable') cli += ` udld port disable\n`;

  // Security features
  if (intf.stormControl > 0) {
    cli += ` storm-control broadcast level ${intf.stormControl}\n storm-control multicast level ${intf.stormControl}\n`;
  }
  if (intf.ipSourceGuard) {
    cli += ` ip verify source\n`;
  }
  
  // Trust & Inspection
  if (intf.dhcpSnoopingTrust) {
    cli += ` ip dhcp snooping trust\n`;
  }
  if (intf.daiTrust) {
    cli += ` ip arp inspection trust\n`;
  }

  return cli;
};

export const generateInterfaceConfig = (interfaces) => {
  if (!interfaces || interfaces.length === 0 || !interfaces.some(i => i.name)) return '';
  let cli = `! INTERFACE CONFIGURATION\n`;

  const portChannels = new Map();
  const seenInterfaces = new Set();
  const uniqueInterfaces = [];

  // Filter out duplicate interfaces (use the latest one if duplicates exist)
  for (let i = interfaces.length - 1; i >= 0; i--) {
    const intf = interfaces[i];
    if (intf.name && !seenInterfaces.has(intf.name)) {
      seenInterfaces.add(intf.name);
      uniqueInterfaces.unshift(intf); // Keep original order, but only first seen from end
    }
  }

  uniqueInterfaces.forEach(intf => {
    if (intf.channelGroup && intf.channelMode) {
      if (!portChannels.has(intf.channelGroup)) {
        portChannels.set(intf.channelGroup, intf); 
      }
    }
  });

  portChannels.forEach((intf, group) => {
    cli += `interface Port-channel ${group}\n`;
    cli += getInterfaceSettings(intf);
    if (intf.status === 'disabled') cli += ` shutdown\n`;
    cli += `!\n`;
  });

  uniqueInterfaces.forEach(intf => {
    cli += `interface ${intf.name}\n`;
    
    if (intf.speed && intf.speed !== 'auto') cli += ` speed ${intf.speed}\n`;
    if (intf.duplex && intf.duplex !== 'auto') cli += ` duplex ${intf.duplex}\n`;

    cli += getInterfaceSettings(intf);

    if (intf.channelGroup && intf.channelMode) {
      cli += ` channel-group ${intf.channelGroup} mode ${intf.channelMode}\n`;
    }

    if (intf.status === 'disabled') {
      cli += ` shutdown\n`;
    }
    
    cli += `!\n`;
  });

  return cli;
};

export const generateMasterConfig = (config) => {
  const activeDevId = config.devices.activeId;
  const vlans = config.vlans.allIds.map(id => config.vlans.byId[id]).filter(v => v.deviceId === activeDevId);
  const interfaces = config.interfaces.allIds.map(id => config.interfaces.byId[id]).filter(i => i.deviceId === activeDevId);
  const security = config.globalSecurity.byId[activeDevId] || {};
  const globalL2 = config.globalL2.byId[activeDevId] || {};
  const stp = config.stp.byId[activeDevId] || {};

  let masterCli = `! Generated via NetConfig Pro NOC Edition\n`;
  masterCli += `enable\nconfigure terminal\n!\n`;
  masterCli += generateGlobalL2Config(globalL2);
  masterCli += generateVlanConfig(vlans);
  masterCli += generateStpConfig(stp);
  masterCli += generateSecurityConfig(security);
  masterCli += generateInterfaceConfig(interfaces);
  masterCli += `end\nwrite memory\n`;
  return masterCli;
};
