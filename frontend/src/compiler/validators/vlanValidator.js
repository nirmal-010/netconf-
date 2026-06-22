export const validateVlans = (vlans, interfaces) => {
  const errors = [];
  const warnings = [];
  const vlanIds = [];
  const activeVlans = new Set();

  // Find all VLANs actively used on interfaces
  interfaces.forEach(intf => {
    if (intf.mode === 'access' && intf.accessVlan) activeVlans.add(parseInt(intf.accessVlan));
    if (intf.mode === 'access' && intf.voiceVlan) activeVlans.add(parseInt(intf.voiceVlan));
    if (intf.mode === 'trunk' && intf.nativeVlan) activeVlans.add(parseInt(intf.nativeVlan));
    if (intf.mode === 'trunk' && intf.trunkAllowed) {
      // Basic parsing of allowed vlans, e.g., '10,20,30-40'
      const parts = intf.trunkAllowed.split(',');
      parts.forEach(p => {
        if (p.includes('-')) {
          const [start, end] = p.split('-');
          for (let i = parseInt(start); i <= parseInt(end); i++) activeVlans.add(i);
        } else {
          activeVlans.add(parseInt(p));
        }
      });
    }
  });

  vlans.forEach(v => {
    const id = parseInt(v.vlanId);
    if (!isNaN(id)) vlanIds.push(id);

    // Error: ID out of range
    if (!isNaN(id) && (id < 1 || id > 4094)) {
      errors.push(`VLAN ID ${id} is out of range (1-4094).`);
    }
    // Error: Missing Name
    if (!v.name || v.name.trim() === '') {
      errors.push(`VLAN ${v.vlanId || 'Unknown'} is missing a name. All VLANs must have a name.`);
    }

    // Warning: Unused VLAN
    if (!activeVlans.has(id)) {
      warnings.push(`VLAN ${id} (${v.name || 'Unnamed'}) is configured but never assigned to any interface.`);
    }
  });

  // Error: Duplicate VLAN IDs
  if (new Set(vlanIds).size !== vlanIds.length) {
    errors.push("Duplicate VLAN IDs found in VLAN Management.");
  }

  return { errors, warnings };
};
