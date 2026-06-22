export const validateConfig = (config) => {
  const errors = [];
  const activeDevId = config.devices.activeId;
  
  const vlans = config.vlans.allIds.map(id => config.vlans.byId[id]).filter(v => v.deviceId === activeDevId);
  const interfaces = config.interfaces.allIds.map(id => config.interfaces.byId[id]).filter(i => i.deviceId === activeDevId);
  const security = config.globalSecurity.byId[activeDevId] || {};

  const vlanIds = vlans.map(v => parseInt(v.vlanId)).filter(id => !isNaN(id));
  
  // ERROR checks
  if (new Set(vlanIds).size !== vlanIds.length) {
    errors.push({ type: 'ERROR', msg: "Duplicate VLAN IDs found in VLAN Management." });
  }
  
  vlanIds.forEach(id => {
    if (id < 1 || id > 4094) {
      errors.push({ type: 'ERROR', msg: `VLAN ID ${id} is out of range (1-4094).` });
    }
  });

  interfaces.forEach(intf => {
    if (!intf.name) return;

    if (intf.portSecurity && intf.mode === 'trunk') {
      errors.push({ type: 'ERROR', msg: `Port Security cannot be configured on trunk port ${intf.name}.` });
    }
    
    if (intf.mode === 'access' && intf.accessVlan) {
      const vId = parseInt(intf.accessVlan);
      if (!isNaN(vId) && !vlanIds.includes(vId)) {
        errors.push({ type: 'ERROR', msg: `VLAN ${vId} is assigned to access port ${intf.name} but does not exist in VLAN Database.` });
      }
    }
    
    // WARNING checks
    if (intf.mode === 'trunk' && (!intf.trunkAllowed || intf.trunkAllowed.trim() === '')) {
      errors.push({ type: 'WARNING', msg: `Trunk allowed VLAN list is empty for ${intf.name}.` });
    }
    if (intf.mode === 'trunk' && !intf.nativeVlan) {
      errors.push({ type: 'WARNING', msg: `Trunk port ${intf.name} is missing a Native VLAN.` });
    }
  });

  if (security.dai && !security.dhcpSnooping) {
    errors.push({ type: 'ERROR', msg: "Dynamic ARP Inspection (DAI) requires DHCP Snooping to be enabled." });
  }

  // RECOMMENDATION checks
  if (!security.bpduGuard) {
    errors.push({ type: 'RECOMMENDATION', msg: "Enable Global BPDU Guard to protect edge ports." });
  }
  if (!security.dhcpSnooping) {
    errors.push({ type: 'RECOMMENDATION', msg: "Enable DHCP Snooping to prevent rogue DHCP servers." });
  }

  return errors;
};
