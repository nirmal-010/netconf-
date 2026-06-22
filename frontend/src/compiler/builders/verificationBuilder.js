import { normalizeInterfaceName } from '../vendors/nameExpander';

export const buildVerificationCommands = (state) => {
  const activeDevId = state.devices.activeId;
  const platform = state.devices.byId[activeDevId]?.platform || 'IOS-XE';
  
  const vlans = state.vlans.allIds.map(id => state.vlans.byId[id]).filter(v => v.deviceId === activeDevId);
  const interfaces = state.interfaces.allIds.map(id => state.interfaces.byId[id]).filter(i => i.deviceId === activeDevId);
  const security = state.globalSecurity.byId[activeDevId] || {};
  const globalL2 = state.globalL2.byId[activeDevId] || {};

  let cli = `\n! ========================================\n`;
  cli += `! VERIFICATION COMMANDS\n`;
  cli += `! Run these to verify the configuration\n`;
  cli += `! ========================================\n\n`;

  // General Status
  if (platform === 'NX-OS') {
    cli += `show running-config\n`;
    cli += `show interface status\n`;
  } else {
    cli += `show running-config\n`;
    cli += `show ip interface brief\n`;
    cli += `show interfaces status\n`;
  }

  // VLANs
  if (vlans.length > 0) {
    cli += `show vlan brief\n`;
    cli += `show spanning-tree summary\n`;
  }

  // Interfaces
  if (interfaces.length > 0) {
    if (interfaces.some(i => i.mode === 'trunk')) {
      if (platform === 'NX-OS') cli += `show interface trunk\n`;
      else cli += `show interfaces trunk\n`;
    }
    
    if (interfaces.some(i => i.channelGroup)) {
      if (platform === 'NX-OS') cli += `show port-channel summary\n`;
      else cli += `show etherchannel summary\n`;
    }

    if (interfaces.some(i => i.portSecurity)) {
      cli += `show port-security\n`;
    }

    if (interfaces.some(i => i.udld && i.udld !== 'disable')) {
      cli += `show udld\n`;
    }
  }

  // Security
  if (security.dhcpSnooping) {
    cli += `show ip dhcp snooping\n`;
    cli += `show ip dhcp snooping binding\n`;
  }
  
  if (security.dai) {
    if (platform === 'NX-OS') cli += `show ip arp inspection\n`;
    else cli += `show ip arp inspection vlan 1-4094\n`;
  }

  // Global L2
  if (globalL2.vtpMode && globalL2.vtpMode !== 'transparent') {
    cli += `show vtp status\n`;
  }

  return cli;
};
