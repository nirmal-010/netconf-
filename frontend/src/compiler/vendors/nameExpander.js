export const normalizeInterfaceName = (type, number, platform) => {
  // If number is undefined or null, fallback cleanly
  const numStr = number || '1/0/1';

  // 1. Map short prefix to long type
  const speedMap = {
    'Fa': 'FastEthernet',
    'Gi': 'GigabitEthernet',
    'Te': 'TenGigabitEthernet',
    'Tw': 'TwentyFiveGigE',
    'Fo': 'FortyGigabitEthernet',
    'Hu': 'HundredGigE',
    'Eth': 'Ethernet',
    'port': 'port'
  };

  const shortType = Object.keys(speedMap).find(key => (type || 'GigabitEthernet').startsWith(key)) || (type || 'GigabitEthernet');
  const baseType = speedMap[shortType] || type || 'GigabitEthernet';

  // 2. Format based exactly on each vendor's native syntax (Rule 9)
  switch (platform) {
    case 'JUNOS': {
      // Juniper expects ge-0/0/1, xe-0/0/1, et-0/0/1
      let prefix = 'ge';
      if (baseType.includes('Ten')) prefix = 'xe';
      else if (baseType.includes('Forty') || baseType.includes('Hundred')) prefix = 'et';
      else if (baseType.includes('Fast')) prefix = 'fe';
      // Ensure unit format like 0/0/1
      const junosParts = numStr.split('/');
      if (junosParts.length === 3) return `${prefix}-${numStr}`;
      if (junosParts.length === 2) return `${prefix}-0/${numStr}`;
      return `${prefix}-0/0/${numStr}`;
    }

    case 'AOS': {
      // Alcatel OmniSwitch 6860E/6900/9900 chassis expects slot/port (1/1) or chassis/slot/port (1/1/1). Never output 0/X.
      const parts = numStr.split('/').map(p => p.trim()).filter(Boolean);
      if (parts.length === 3) {
        const chassis = parts[0] === '0' ? '1' : parts[0];
        const slot = parts[1] === '0' ? '1' : parts[1];
        return `${chassis}/${slot}/${parts[2]}`;
      }
      if (parts.length === 2) {
        const slot = parts[0] === '0' ? '1' : parts[0];
        return `${slot}/${parts[1]}`;
      }
      return `1/1/${numStr}`;
    }

    case 'D-Link': {
      // D-Link expects '1' or '1-24' (in CLI port selection: config ports 1)
      const dlinkParts = numStr.split('/');
      return dlinkParts[dlinkParts.length - 1] || numStr;
    }

    case 'NX-OS':
    case 'EOS': {
      // Arista / NX-OS expects Ethernet1 or Ethernet1/1
      if (baseType.includes('Ethernet') || baseType.includes('GigE')) {
        return `Ethernet${numStr}`;
      }
      return `${baseType}${numStr}`;
    }

    case 'AOS-CX': {
      // Aruba CX expects 1/1/1
      if (baseType.includes('Ethernet') || baseType.includes('GigE')) {
        return numStr;
      }
      return `${baseType}${numStr}`;
    }

    case 'AW+': {
      // AlliedWare Plus expects port1.0.1
      if (baseType.includes('Ethernet') || baseType.includes('GigE') || baseType.includes('port')) {
        return `port${numStr.replace(/\//g, '.')}`;
      }
      return `${baseType}${numStr}`;
    }

    case 'JetStream': {
      // TP-Link JetStream expects gigabitEthernet 1/0/1 or gigabitEthernet1/0/1
      if (baseType === 'GigabitEthernet') return `gigabitEthernet ${numStr}`;
      if (baseType === 'FastEthernet') return `fastEthernet ${numStr}`;
      if (baseType === 'TenGigabitEthernet') return `ten-gigabitEthernet ${numStr}`;
      return `${baseType} ${numStr}`;
    }

    case 'IOS-XE':
    default:
      return `${baseType}${numStr}`;
  }
};
