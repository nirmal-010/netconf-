export const validateInterfaces = (interfaces, vlans) => {
  const errors = [];
  const warnings = [];
  const interfaceNames = [];
  const vlanIds = vlans.map(v => parseInt(v.vlanId)).filter(id => !isNaN(id));

  interfaces.forEach(intf => {
    if (!intf.name) return;

    // Error: Duplicate interfaces
    if (interfaceNames.includes(intf.name)) {
      errors.push(`Duplicate configuration detected for interface ${intf.name}. All settings must be merged into a single block.`);
    }
    interfaceNames.push(intf.name);

    // Security constraints
    if (intf.portSecurity && intf.mode === 'trunk') {
      errors.push(`Port Security cannot be configured on trunk port ${intf.name}. It requires an access port.`);
    }

    if (intf.mode === 'access') {
      const vId = parseInt(intf.accessVlan);
      if (!isNaN(vId) && !vlanIds.includes(vId)) {
        errors.push(`Access VLAN ${vId} is assigned to port ${intf.name} but does not exist in the VLAN Database.`);
      }
      
      const voiceId = parseInt(intf.voiceVlan);
      if (!isNaN(voiceId) && !vlanIds.includes(voiceId)) {
        errors.push(`Voice VLAN ${voiceId} is assigned to port ${intf.name} but does not exist in the VLAN Database.`);
      }
    } else if (intf.mode === 'trunk') {
      // Native VLAN check
      if (intf.nativeVlan) {
        const nativeId = parseInt(intf.nativeVlan);
        if (!isNaN(nativeId) && !vlanIds.includes(nativeId)) {
          errors.push(`Native VLAN ${nativeId} on trunk ${intf.name} does not exist in the VLAN Database.`);
        }
      } else {
        warnings.push(`Trunk port ${intf.name} is missing an explicit Native VLAN. Using default VLAN 1.`);
      }

      // Allowed VLANs check
      if (!intf.trunkAllowed || intf.trunkAllowed.trim() === '') {
        warnings.push(`Trunk port ${intf.name} has no allowed VLAN list. It will allow all VLANs by default.`);
      } else {
        const parts = intf.trunkAllowed.split(',');
        parts.forEach(p => {
          if (p.includes('-')) {
            const [start, end] = p.split('-');
            for (let i = parseInt(start); i <= parseInt(end); i++) {
              if (!vlanIds.includes(i)) warnings.push(`Allowed VLAN ${i} on trunk ${intf.name} is not created in the database.`);
            }
          } else {
            const id = parseInt(p);
            if (!isNaN(id) && !vlanIds.includes(id)) {
              warnings.push(`Allowed VLAN ${id} on trunk ${intf.name} is not created in the database.`);
            }
          }
        });
      }
    }
  });

  return { errors, warnings };
};
