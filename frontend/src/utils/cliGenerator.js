export const generateVlanConfig = (vlans) => {
  if (!vlans || vlans.length === 0 || !vlans.some(v => v.vlanId)) return '';
  let cli = `! VLAN CONFIGURATION\n`;
  vlans.forEach(v => {
    if (v.vlanId) {
      cli += `vlan ${v.vlanId}\n`;
      if (v.name) cli += ` name ${v.name}\n`;
    }
  });
  return cli + `!\n`;
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
  return cli + `!\n`;
};

export const generateInterfaceConfig = (interfaces) => {
  if (!interfaces || interfaces.length === 0 || !interfaces.some(i => i.name)) return '';
  let cli = `! INTERFACE CONFIGURATION\n`;
  interfaces.forEach(intf => {
    if (!intf.name) return;
    cli += `interface ${intf.name}\n`;
    if (intf.description) cli += ` description ${intf.description}\n`;
    
    if (intf.mode === 'access') {
      cli += ` switchport mode access\n`;
      if (intf.accessVlan) cli += ` switchport access vlan ${intf.accessVlan}\n`;
      if (intf.portSecurity) {
        cli += ` switchport port-security\n switchport port-security maximum 2\n switchport port-security violation restrict\n switchport port-security mac-address sticky\n`;
      }
    } else if (intf.mode === 'trunk') {
      cli += ` switchport mode trunk\n`;
      if (intf.trunkAllowed) cli += ` switchport trunk allowed vlan ${intf.trunkAllowed}\n`;
      if (intf.nativeVlan) cli += ` switchport trunk native vlan ${intf.nativeVlan}\n`;
    }

    if (intf.stormControl > 0) {
      cli += ` storm-control broadcast level ${intf.stormControl}\n storm-control multicast level ${intf.stormControl}\n`;
    }
    if (intf.ipSourceGuard) {
      cli += ` ip verify source\n`;
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
  const stp = config.stp.byId[activeDevId] || {};

  let masterCli = `! Generated via NetConfig Pro NOC Edition\n`;
  masterCli += `enable\nconfigure terminal\n!\n`;
  masterCli += generateVlanConfig(vlans);
  masterCli += generateStpConfig(stp);
  masterCli += generateSecurityConfig(security);
  masterCli += generateInterfaceConfig(interfaces);
  masterCli += `end\nwrite memory\n`;
  return masterCli;
};
