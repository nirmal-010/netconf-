import { normalizeInterfaceName } from '../vendors/nameExpander.js';

export const buildVerificationCommands = (state) => {
  const activeDevId = state.devices?.activeId || 'dev-01';
  const platform = state.devices?.byId?.[activeDevId]?.platform || 'IOS-XE';

  if (state.workspace?.activeNav === 'l3') {
    const l3 = state.l3?.byId?.[activeDevId] || { routingVendor: 'cisco' };
    const vendor = l3.routingVendor || 'cisco';
    const commands = [];

    switch (vendor) {
      case 'juniper':
        commands.push('show configuration interfaces');
        commands.push('show configuration protocols');
        commands.push('show interfaces terse');
        commands.push('show route');
        if (l3.enableOspf) {
          commands.push('show ospf neighbor');
          commands.push('show ospf database');
        }
        if (l3.enableBgp) {
          commands.push('show bgp summary');
          commands.push('show bgp neighbor');
        }
        break;

      case 'alcatel':
        commands.push('show ip interface');
        commands.push('show ip routes');
        if (l3.enableOspf) {
          commands.push('show ip ospf neighbor');
          commands.push('show ip ospf database');
        }
        if (l3.enableBgp) {
          commands.push('show ip bgp neighbors');
        }
        break;

      case 'dlink':
        commands.push('show ip interface');
        commands.push('show iproute');
        if (l3.enableOspf) commands.push('show ospf neighbor');
        if (l3.enableBgp) commands.push('show bgp peer');
        break;

      case 'arista':
        commands.push('show running-config section router');
        commands.push('show ip interface brief');
        commands.push('show ip route');
        if (l3.enableOspf) {
          commands.push('show ip ospf neighbor');
          commands.push('show ip ospf database');
        }
        if (l3.enableBgp) {
          commands.push('show ip bgp summary');
        }
        break;

      case 'aruba':
      case 'allied':
        commands.push('show ip interface brief');
        commands.push('show ip route');
        if (l3.enableOspf) commands.push('show ip ospf neighbors');
        if (l3.enableBgp) commands.push('show bgp summary');
        break;

      case 'tplink':
        commands.push('show ip interface brief');
        commands.push('show ip route');
        if (l3.enableOspf) commands.push('show ip ospf neighbor');
        break;

      case 'cisco':
      default:
        commands.push('show running-config | section ^router|^ip route');
        commands.push('show ip interface brief');
        commands.push('show ip route');
        if (l3.enableOspf) {
          commands.push('show ip ospf neighbor');
          commands.push('show ip ospf database');
        }
        if (l3.enableBgp) {
          commands.push('show ip bgp summary');
          commands.push('show ip bgp neighbors');
        }
        break;
    }

    let cli = `\n! ====================================================================\n`;
    cli += `! LAYER 3 DIAGNOSTIC & VERIFICATION COMMANDS (${vendor.toUpperCase()})\n`;
    cli += `! Execute these operational commands to verify routing convergence\n`;
    cli += `! ====================================================================\n\n`;
    commands.forEach(cmd => { cli += `${cmd}\n`; });
    return cli;
  }

  // Layer 2 Verification Commands
  const vlans = state.vlans?.allIds?.map(id => state.vlans.byId[id]).filter(v => v.deviceId === activeDevId) || [];
  const interfaces = state.interfaces?.allIds?.map(id => state.interfaces.byId[id]).filter(i => i.deviceId === activeDevId) || [];
  const security = state.globalSecurity?.byId?.[activeDevId] || {};
  const globalL2 = state.globalL2?.byId?.[activeDevId] || {};
  const stp = state.stp?.byId?.[activeDevId] || {};
  const commands = [];

  switch (platform) {
    case 'JUNOS':
      commands.push('show configuration interfaces');
      commands.push('show configuration vlans');
      commands.push('show interfaces terse');
      if (vlans.length > 0) commands.push('show vlans');
      commands.push('show ethernet-switching interfaces');
      if (interfaces.some(i => i.channelGroup)) commands.push('show lacp interfaces');
      if (stp.mode !== 'none') commands.push('show spanning-tree bridge');
      break;

    case 'AOS':
      // Alcatel OmniSwitch
      commands.push('show configuration snapshot');
      commands.push('show interfaces status');
      if (vlans.length > 0) commands.push('show vlan');
      if (interfaces.some(i => i.channelGroup)) commands.push('show linkagg port');
      if (stp.mode !== 'none') commands.push('show spantree cist');
      break;

    case 'D-Link':
      commands.push('show config current_config');
      commands.push('show ports');
      if (vlans.length > 0) commands.push('show vlan');
      if (interfaces.some(i => i.channelGroup)) commands.push('show lacp_port');
      if (stp.mode !== 'none') commands.push('show stp');
      break;

    case 'NX-OS':
      commands.push('show running-config');
      commands.push('show interface status');
      if (vlans.length > 0) commands.push('show vlan brief');
      if (interfaces.some(i => i.mode === 'trunk')) commands.push('show interface trunk');
      if (interfaces.some(i => i.channelGroup)) commands.push('show port-channel summary');
      if (stp.mode !== 'none') commands.push('show spanning-tree summary');
      break;

    case 'EOS':
      commands.push('show running-config');
      commands.push('show interfaces status');
      if (vlans.length > 0) commands.push('show vlan');
      if (interfaces.some(i => i.mode === 'trunk')) commands.push('show interfaces trunk');
      if (interfaces.some(i => i.channelGroup)) commands.push('show port-channel summary');
      if (stp.mode !== 'none') commands.push('show spanning-tree topology status');
      break;

    case 'AOS-CX':
      commands.push('show running-config');
      commands.push('show interface brief');
      if (vlans.length > 0) commands.push('show vlan');
      if (interfaces.some(i => i.channelGroup)) commands.push('show lag');
      if (stp.mode !== 'none') commands.push('show spanning-tree');
      if (security.dhcpSnooping) commands.push('show dhcp-snooping');
      break;

    case 'AW+':
      // AlliedWare Plus
      commands.push('show running-config');
      commands.push('show interface switchport');
      if (vlans.length > 0) commands.push('show switch vlan');
      if (interfaces.some(i => i.channelGroup)) commands.push('show etherchannel summary');
      if (stp.mode !== 'none') commands.push('show spanning-tree');
      break;

    case 'JetStream':
      commands.push('show running-config');
      commands.push('show interface configuration');
      if (vlans.length > 0) commands.push('show vlan');
      if (interfaces.some(i => i.channelGroup)) commands.push('show port-channel');
      if (stp.mode !== 'none') commands.push('show spanning-tree active');
      break;

    case 'IOS-XE':
    default:
      commands.push('show running-config');
      commands.push('show ip interface brief');
      commands.push('show interfaces status');
      if (vlans.length > 0) {
        commands.push('show vlan brief');
        commands.push('show spanning-tree summary');
      }
      if (interfaces.some(i => i.mode === 'trunk')) commands.push('show interfaces trunk');
      if (interfaces.some(i => i.channelGroup)) commands.push('show etherchannel summary');
      if (security.dhcpSnooping) {
        commands.push('show ip dhcp snooping');
        commands.push('show ip dhcp snooping binding');
      }
      if (security.dai) commands.push('show ip arp inspection vlan 1-4094');
      break;
  }

  // Interface specific features across vendors
  if (interfaces.some(i => i.portSecurity)) {
    if (platform === 'IOS-XE' || platform === 'NX-OS') commands.push('show port-security');
  }
  if (interfaces.some(i => i.udld && i.udld !== 'disable')) {
    if (platform === 'IOS-XE' || platform === 'NX-OS') commands.push('show udld');
  }
  if (globalL2.vtpMode && globalL2.vtpMode !== 'transparent') {
    if (platform === 'IOS-XE' || platform === 'NX-OS') commands.push('show vtp status');
  }

  let cli = `\n! ====================================================================\n`;
  cli += `! OPERATIONAL DIAGNOSTICS & VERIFICATION COMMANDS (${platform})\n`;
  cli += `! Run these post-deployment checks to confirm fabric state\n`;
  cli += `! ====================================================================\n\n`;
  
  commands.forEach(cmd => {
    cli += `${cmd}\n`;
  });

  return cli;
};
