export const normalizeInterfaceName = (name, platform) => {
  if (!name) return name;
  
  // Extract the prefix (letters) and the port number (digits and slashes)
  const match = name.match(/^([a-zA-Z]+)([\d\/\.]+)$/);
  if (!match) return name; // Return as-is if it doesn't match standard patterns

  const prefix = match[1].toLowerCase();
  const port = match[2];

  if (platform === 'NX-OS') {
    // NX-OS uses 'Ethernet' for all physical copper/fiber links (1G, 10G, 40G, 100G)
    if (['f', 'fa', 'fastethernet', 'g', 'gi', 'gigabitethernet', 'te', 't', 'tengigabitethernet', 'e', 'eth', 'ethernet'].includes(prefix)) {
      return `Ethernet${port}`;
    }
  } else {
    // IOS / IOS-XE Expansions
    if (['f', 'fa'].includes(prefix)) return `FastEthernet${port}`;
    if (['g', 'gi'].includes(prefix)) return `GigabitEthernet${port}`;
    if (['te', 't'].includes(prefix)) return `TenGigabitEthernet${port}`;
    if (['e', 'eth'].includes(prefix)) return `Ethernet${port}`;
    if (['fo'].includes(prefix)) return `FortyGigabitEthernet${port}`;
    if (['hu'].includes(prefix)) return `HundredGigE${port}`;
    if (['tw'].includes(prefix)) return `TwoGigabitEthernet${port}`;
    if (['fi'].includes(prefix)) return `FiveGigabitEthernet${port}`;
    if (['v', 'vl'].includes(prefix)) return `Vlan${port}`;
    if (['lo'].includes(prefix)) return `Loopback${port}`;
    if (['po'].includes(prefix)) return `Port-channel${port}`;
    if (['tu'].includes(prefix)) return `Tunnel${port}`;
  }

  // If we didn't match a known abbreviation, just capitalize the first letter and return it
  return name.charAt(0).toUpperCase() + name.slice(1);
};
