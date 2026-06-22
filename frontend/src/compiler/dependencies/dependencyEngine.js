export const checkDependencies = (state) => {
  const errors = [];
  const warnings = [];

  const activeDevId = state.devices.activeId;
  const security = state.globalSecurity.byId[activeDevId] || {};
  const interfaces = state.interfaces.allIds.map(id => state.interfaces.byId[id]).filter(i => i.deviceId === activeDevId);

  // DAI Requires DHCP Snooping
  if (security.dai && !security.dhcpSnooping) {
    errors.push("Dynamic ARP Inspection (DAI) requires DHCP Snooping to be enabled globally.");
  }

  // Voice VLAN requires Access VLAN
  interfaces.forEach(intf => {
    if (intf.mode === 'access' && intf.voiceVlan && !intf.accessVlan) {
      errors.push(`Interface ${intf.name} has a Voice VLAN but no Access VLAN. IP Phones require an Access VLAN for PC passthrough traffic.`);
    }

    if (intf.ipSourceGuard && !security.dhcpSnooping) {
      errors.push(`Interface ${intf.name} has IP Source Guard enabled, which requires Global DHCP Snooping.`);
    }
  });

  // EtherChannel Consistency
  const portChannels = new Map();
  interfaces.forEach(intf => {
    if (intf.channelGroup && intf.channelMode) {
      if (!portChannels.has(intf.channelGroup)) {
        portChannels.set(intf.channelGroup, []);
      }
      portChannels.get(intf.channelGroup).push(intf);
    }
  });

  portChannels.forEach((members, group) => {
    if (members.length < 2) {
      warnings.push(`Port-channel ${group} only has ${members.length} member interface(s). EtherChannels typically require at least 2 members.`);
    }
    
    // Check for speed/duplex mismatch
    const speed = members[0].speed;
    const duplex = members[0].duplex;
    const mode = members[0].mode;

    members.forEach(m => {
      if (m.speed !== speed || m.duplex !== duplex || m.mode !== mode) {
        errors.push(`Inconsistent configuration detected on Port-channel ${group} members. Speed, duplex, and switchport mode must match across all members.`);
      }
    });
  });

  // Stubs for Future HSRP/OSPF/BGP Support
  const hasHSRP = false; // Stub
  const hasSVI = false; // Stub
  if (hasHSRP && !hasSVI) {
    errors.push("HSRP is configured, but no Switch Virtual Interface (SVI) exists for the subnet.");
  }

  const hasOSPF = false; // Stub
  const hasRoutedInterface = false; // Stub
  if (hasOSPF && !hasRoutedInterface) {
    errors.push("OSPF is enabled, but the device has no L3 routed interfaces to form adjacencies.");
  }

  return { errors, warnings };
};
