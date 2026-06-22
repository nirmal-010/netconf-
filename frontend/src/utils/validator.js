export const validateConfig = (config) => {
  const errors = [];
  const activeDevId = config.devices.activeId;
  
  const vlans = config.vlans.allIds.map(id => config.vlans.byId[id]).filter(v => v.deviceId === activeDevId);
  const interfaces = config.interfaces.allIds.map(id => config.interfaces.byId[id]).filter(i => i.deviceId === activeDevId);
  const security = config.globalSecurity.byId[activeDevId] || {};

  const vlanIds = vlans.map(v => parseInt(v.vlanId)).filter(id => !isNaN(id));
  
  // 1. VLAN Validation
  if (new Set(vlanIds).size !== vlanIds.length) {
    errors.push({ type: 'ERROR', msg: "Duplicate VLAN IDs found in VLAN Management." });
  }
  
  vlans.forEach(v => {
    const id = parseInt(v.vlanId);
    if (!isNaN(id) && (id < 1 || id > 4094)) {
      errors.push({ type: 'ERROR', msg: `VLAN ID ${id} is out of range (1-4094).` });
    }
    if (!v.name || v.name.trim() === '') {
      errors.push({ type: 'ERROR', msg: `VLAN ${v.vlanId || 'Unknown'} is missing a name. All VLANs must have a name.` });
    }
  });

  // 2. Interface Validation
  const interfaceNames = [];
  let hasDhcpTrust = false;
  let hasDaiTrust = false;

  interfaces.forEach(intf => {
    if (!intf.name) return;

    if (interfaceNames.includes(intf.name)) {
      errors.push({ type: 'ERROR', msg: `Duplicate configuration detected for interface ${intf.name}. Merge them into a single block.` });
    }
    interfaceNames.push(intf.name);

    if (intf.portSecurity && intf.mode === 'trunk') {
      errors.push({ type: 'ERROR', msg: `Port Security cannot be configured on trunk port ${intf.name}.` });
    }
    
    if (intf.mode === 'access') {
      const vId = parseInt(intf.accessVlan);
      if (!isNaN(vId) && !vlanIds.includes(vId)) {
        errors.push({ type: 'ERROR', msg: `VLAN ${vId} is assigned to access port ${intf.name} but does not exist in VLAN Database.` });
      }
      
      const voiceId = parseInt(intf.voiceVlan);
      if (!isNaN(voiceId)) {
        if (!vlanIds.includes(voiceId)) {
          errors.push({ type: 'ERROR', msg: `Voice VLAN ${voiceId} is assigned to port ${intf.name} but does not exist in VLAN Database.` });
        }
        if (isNaN(vId)) {
          errors.push({ type: 'ERROR', msg: `Voice VLAN is configured on ${intf.name}, but an Access VLAN is missing.` });
        }
      }
    } else if (intf.mode === 'trunk') {
      if (intf.nativeVlan) {
        const nativeId = parseInt(intf.nativeVlan);
        if (!isNaN(nativeId) && !vlanIds.includes(nativeId)) {
          errors.push({ type: 'ERROR', msg: `Native VLAN ${nativeId} on trunk ${intf.name} does not exist in VLAN Database.` });
        }
      } else {
        errors.push({ type: 'WARNING', msg: `Trunk port ${intf.name} is missing an explicit Native VLAN.` });
      }

      if (!intf.trunkAllowed || intf.trunkAllowed.trim() === '') {
        errors.push({ type: 'WARNING', msg: `Trunk allowed VLAN list is empty for ${intf.name}.` });
      }
    }

    if (intf.dhcpSnoopingTrust) hasDhcpTrust = true;
    if (intf.daiTrust) hasDaiTrust = true;
  });

  // 3. Security Dependencies
  if (security.dai && !security.dhcpSnooping) {
    errors.push({ type: 'ERROR', msg: "Dynamic ARP Inspection (DAI) requires DHCP Snooping to be enabled." });
  }

  if (security.dhcpSnooping && !hasDhcpTrust) {
    errors.push({ type: 'ERROR', msg: "DHCP Snooping is enabled globally, but no interfaces are configured as DHCP Snooping Trusted. DHCP replies will be dropped." });
  }

  if (security.dai && !hasDaiTrust) {
    errors.push({ type: 'ERROR', msg: "Dynamic ARP Inspection (DAI) is enabled globally, but no interfaces are configured as DAI Trusted. ARP replies will be dropped on uplinks." });
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
