export const validateSecurity = (security, interfaces) => {
  const errors = [];
  const warnings = [];

  let hasDhcpTrust = false;
  let hasDaiTrust = false;
  let hasPortSecurity = false;
  let hasBpduGuardTrunk = false;

  interfaces.forEach(intf => {
    if (intf.dhcpSnoopingTrust) hasDhcpTrust = true;
    if (intf.daiTrust) hasDaiTrust = true;
    if (intf.portSecurity) hasPortSecurity = true;
    if (intf.mode === 'trunk' && intf.bpduGuard === 'enable') hasBpduGuardTrunk = true;
  });

  if (security.dhcpSnooping && !hasDhcpTrust) {
    errors.push("DHCP Snooping is enabled globally, but no interfaces are trusted. DHCP server replies will be dropped.");
  }

  if (security.dai && !hasDaiTrust) {
    errors.push("Dynamic ARP Inspection (DAI) is enabled globally, but no interfaces are trusted. ARP replies from uplinks will be dropped.");
  }

  if (hasBpduGuardTrunk) {
    warnings.push("BPDU Guard is forced on a trunk port. Ensure this is an edge trunk (like a server link), otherwise it will errdisable the port.");
  }

  if (!security.bpduGuard) {
    warnings.push("Global BPDU Guard is disabled. It is highly recommended to protect edge ports from loops.");
  }

  if (!security.dhcpSnooping) {
    warnings.push("Global DHCP Snooping is disabled. Network is vulnerable to rogue DHCP servers.");
  }

  return { errors, warnings };
};
