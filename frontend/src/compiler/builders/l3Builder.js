export const buildL3Config = (state) => {
  const activeId = state.devices?.activeId || 'dev-01';
  const device = state.devices?.byId?.[activeId] || { hostname: 'RTR-CORE-01' };
  const l3 = state.l3?.byId?.[activeId] || {
    routingVendor: 'cisco', enableOspf: false, ospfProcessId: '100', ospfRouterId: '1.1.1.1', ospfNetworks: [],
    enableBgp: false, bgpAsn: '65100', bgpRouterId: '1.1.1.1', bgpNeighbors: [], staticRoutes: []
  };

  const vendor = l3.routingVendor || 'cisco';
  let cli = ``;

  // --- JUNIPER JUNOS L3 ROUTING SYNTAX ---
  if (vendor === 'juniper') {
    cli += `/* Generated via NetConfig Pro Enterprise Compiler (Juniper Junos OS) */\n`;
    cli += `/* Target Platform: Juniper MX/SRX/QFX Series Enterprise Router */\n\n`;
    cli += `configure\n\n`;

    cli += `/* === SYSTEM HOSTNAME & ROUTER-ID === */\n`;
    cli += `system {\n`;
    cli += `    host-name ${device.hostname || 'RTR-CORE-01'};\n`;
    cli += `}\n\n`;

    if (l3.enableOspf || l3.enableBgp || (l3.staticRoutes && l3.staticRoutes.length > 0)) {
      cli += `routing-options {\n`;
      if (l3.ospfRouterId || l3.bgpRouterId) {
        cli += `    router-id ${l3.ospfRouterId || l3.bgpRouterId || '1.1.1.1'};\n`;
      }
      if (l3.bgpAsn && l3.enableBgp) {
        cli += `    autonomous-system ${l3.bgpAsn};\n`;
      }
      if (l3.staticRoutes && l3.staticRoutes.length > 0) {
        cli += `    static {\n`;
        l3.staticRoutes.forEach(rt => {
          const prefixLen = maskToPrefixLength(rt.mask || '255.255.255.0');
          const metric = rt.distance && rt.distance !== '1' ? ` preference ${rt.distance};` : `;`;
          cli += `        route ${rt.prefix}/${prefixLen} next-hop ${rt.nextHop}${metric}\n`;
        });
        cli += `    }\n`;
      }
      cli += `}\n\n`;
    }

    if (l3.enableOspf || l3.enableBgp) {
      cli += `/* === PROTOCOLS CONFIGURATION === */\n`;
      cli += `protocols {\n`;
      if (l3.enableOspf) {
        cli += `    ospf {\n`;
        l3.ospfNetworks.forEach(net => {
          const areaFormatted = net.area && net.area.includes('.') ? net.area : `${net.area || '0'}.0.0.0`;
          cli += `        area ${areaFormatted} {\n`;
          cli += `            interface all;\n`;
          cli += `        }\n`;
        });
        cli += `    }\n`;
      }
      if (l3.enableBgp) {
        cli += `    bgp {\n`;
        cli += `        group EXTERNAL-PEERS {\n`;
        cli += `            type external;\n`;
        l3.bgpNeighbors.forEach(nbr => {
          cli += `            neighbor ${nbr.ip} {\n`;
          cli += `                peer-as ${nbr.remoteAs};\n`;
          if (nbr.description) cli += `                description "${nbr.description}";\n`;
          cli += `            }\n`;
        });
        cli += `        }\n`;
        cli += `    }\n`;
      }
      cli += `}\n\n`;
    }

    cli += `/* === COMMIT ROUTING CONFIGURATION === */\n`;
    cli += `commit check\n`;
    cli += `commit comment "L3 Routing Policy Deployed via NetConfig Pro"\n`;
    return cli;
  }

  // --- ALCATEL OMNISWITCH (AOS) L3 ROUTING SYNTAX ---
  if (vendor === 'alcatel') {
    cli += `! Generated via NetConfig Pro Enterprise Compiler (Alcatel-Lucent AOS)\n`;
    cli += `! Target Platform: Alcatel OmniSwitch Enterprise Core Router\n\n`;
    cli += `configure system\n!\n`;
    cli += `system name "${device.hostname || 'RTR-CORE-01'}"\n!\n`;

    if (l3.staticRoutes && l3.staticRoutes.length > 0) {
      cli += `! === STATIC ROUTING TABLE ===\n`;
      l3.staticRoutes.forEach(rt => {
        const metric = rt.distance && rt.distance !== '1' ? ` metric ${rt.distance}` : '';
        cli += `ip route ${rt.prefix} ${rt.mask || '255.255.255.0'} ${rt.nextHop}${metric}\n`;
      });
      cli += `!\n`;
    }

    if (l3.enableOspf) {
      cli += `! === OSPF DYNAMIC ROUTING (AOS Release 8 Native) ===\n`;
      cli += `! Note: AOS 8 initializes protocols without legacy AOS6 'ip load ospf' module loading\n`;
      cli += `ip router ospf\n`;
      cli += `ip ospf status enable\n`;
      cli += `ip ospf router-id ${l3.ospfRouterId || '1.1.1.1'}\n`;
      l3.ospfNetworks.forEach(net => {
        const areaFormatted = net.area && net.area.includes('.') ? net.area : `${net.area || '0'}.0.0.0`;
        cli += `ip ospf area ${areaFormatted}\n`;
        cli += `ip ospf area ${areaFormatted} status enable\n`;
      });
      cli += `!\n`;
    }

    if (l3.enableBgp) {
      cli += `! === BGP EXTERIOR PEERING (AOS Release 8 Native) ===\n`;
      cli += `! Note: AOS 8 initializes BGP without legacy AOS6 'ip load bgp' module loading\n`;
      cli += `ip router bgp\n`;
      cli += `ip bgp autonomous-system ${l3.bgpAsn || '65100'}\n`;
      cli += `ip bgp status enable\n`;
      if (l3.bgpRouterId) cli += `ip bgp router-id ${l3.bgpRouterId}\n`;
      l3.bgpNeighbors.forEach(nbr => {
        cli += `ip bgp neighbor ${nbr.ip} as ${nbr.remoteAs}\n`;
        cli += `ip bgp neighbor ${nbr.ip} status enable\n`;
        if (nbr.description) cli += `ip bgp neighbor ${nbr.ip} description "${nbr.description}"\n`;
      });
      cli += `!\n`;
    }

    cli += `! === TWO-STAGE CONFIGURATION PERSISTENCE (AOS Release 8) ===\n`;
    cli += `! Stage 1: Save active configuration changes to working directory\n`;
    cli += `copy running-config working\n`;
    cli += `! Stage 2: Certify working configuration to survive chassis reboots\n`;
    cli += `! Note: Comment out Stage 2 if staging/testing before certifying:\n`;
    cli += `copy working certified\n`;
    return cli;
  }

  // --- D-LINK DGS/DXS L3 ROUTING SYNTAX ---
  if (vendor === 'dlink') {
    cli += `# Generated via NetConfig Pro Enterprise Compiler (D-Link DGS/DXS Series)\n`;
    cli += `# Target Platform: D-Link Enterprise L3 Routing Core Switch\n\n`;
    cli += `disable clipaging\n#\n`;

    if (l3.staticRoutes && l3.staticRoutes.length > 0) {
      cli += `# === STATIC ROUTE TABLE ===\n`;
      l3.staticRoutes.forEach(rt => {
        const prefixLen = maskToPrefixLength(rt.mask || '255.255.255.0');
        const metric = rt.distance && rt.distance !== '1' ? ` metric ${rt.distance}` : ` metric 1`;
        cli += `create iproute ${rt.prefix}/${prefixLen} ${rt.nextHop}${metric}\n`;
      });
      cli += `#\n`;
    }

    if (l3.enableOspf) {
      cli += `# === OSPF ROUTING PROTOCOL ===\n`;
      cli += `config ospf router_id ${l3.ospfRouterId || '1.1.1.1'}\n`;
      cli += `enable ospf\n`;
      l3.ospfNetworks.forEach(net => {
        const areaFormatted = net.area && net.area.includes('.') ? net.area : `${net.area || '0'}.0.0.0`;
        cli += `create ospf area ${areaFormatted} type normal\n`;
      });
      cli += `#\n`;
    }

    if (l3.enableBgp) {
      cli += `# === BGP ROUTING PROTOCOL ===\n`;
      cli += `config bgp as_number ${l3.bgpAsn || '65100'}\n`;
      cli += `config bgp router_id ${l3.bgpRouterId || '1.1.1.1'}\n`;
      cli += `enable bgp\n`;
      l3.bgpNeighbors.forEach(nbr => {
        cli += `create bgp peer ${nbr.ip} remote_as ${nbr.remoteAs}\n`;
        cli += `config bgp peer ${nbr.ip} state enable\n`;
      });
      cli += `#\n`;
    }

    cli += `# === SAVE CONFIGURATION ===\n`;
    cli += `save\n`;
    return cli;
  }

  // --- CISCO / ARISTA / ARUBA / ALLIED / TPLINK L3 ROUTING SYNTAX ---
  cli += `! ====================================================================\n`;
  cli += `! NetConfig Pro — Enterprise Layer 3 Routing Engine\n`;
  cli += `! Target Router Hostname : ${device.hostname || 'RTR-CORE-01'}\n`;
  cli += `! Target Operating System: ${getVendorName(vendor)}\n`;
  cli += `! Generated At           : ${new Date().toUTCString()}\n`;
  cli += `! ====================================================================\n\n`;

  // Enter configuration mode
  if (vendor === 'cisco' || vendor === 'arista' || vendor === 'aruba' || vendor === 'allied') {
    cli += `enable\nconfigure terminal\n!\n`;
  } else if (vendor === 'tplink') {
    cli += `enable\nconfigure\n!\n`;
  }

  // Hostname & Base Routing
  cli += `hostname ${device.hostname || 'RTR-CORE-01'}\n`;
  if (vendor === 'cisco' || vendor === 'arista' || vendor === 'tplink') {
    cli += `ip routing\n`;
  } else if (vendor === 'aruba') {
    cli += `ip routing\n! Aruba AOS-CX L3 Routing Engine enabled\n`;
  }
  cli += `!\n`;

  // OSPF Dynamic Routing
  if (l3.enableOspf) {
    cli += `! --- OSPF Dynamic Routing Configuration ---\n`;
    if (vendor === 'cisco' || vendor === 'nx-os') {
      cli += `router ospf ${l3.ospfProcessId || '1'}\n`;
      if (l3.ospfRouterId) cli += ` router-id ${l3.ospfRouterId}\n`;
      cli += ` passive-interface default\n`;
      l3.ospfNetworks.forEach(net => {
        cli += ` network ${net.network} ${net.wildcard || '0.0.0.255'} area ${net.area || '0'}\n`;
      });
    } else if (vendor === 'arista') {
      cli += `router ospf ${l3.ospfProcessId || '1'}\n`;
      if (l3.ospfRouterId) cli += ` router-id ${l3.ospfRouterId}\n`;
      cli += ` passive-interface default\n`;
      cli += ` max-lsa 12000\n`;
      l3.ospfNetworks.forEach(net => {
        cli += ` network ${net.network}/${maskToPrefixLength(net.wildcard)} area ${net.area || '0'}\n`;
      });
    } else if (vendor === 'aruba') {
      cli += `router ospf ${l3.ospfProcessId || '1'}\n`;
      if (l3.ospfRouterId) cli += ` router-id ${l3.ospfRouterId}\n`;
      l3.ospfNetworks.forEach(net => {
        cli += ` area ${net.area || '0'}\n`;
      });
      cli += `! Note: In AOS-CX, apply 'ip ospf ${l3.ospfProcessId || '1'} area 0' directly on routed SVIs/interfaces\n`;
    } else if (vendor === 'allied') {
      cli += `router ospf ${l3.ospfProcessId || '1'}\n`;
      if (l3.ospfRouterId) cli += ` ospf router-id ${l3.ospfRouterId}\n`;
      l3.ospfNetworks.forEach(net => {
        cli += ` network ${net.network}/${maskToPrefixLength(net.wildcard)} area ${net.area || '0'}\n`;
      });
    } else if (vendor === 'tplink') {
      cli += `router ospf ${l3.ospfProcessId || '1'}\n`;
      if (l3.ospfRouterId) cli += ` router-id ${l3.ospfRouterId}\n`;
      l3.ospfNetworks.forEach(net => {
        cli += ` network ${net.network} ${net.wildcard || '0.0.0.255'} area ${net.area || '0'}\n`;
      });
    }
    cli += `!\n`;
  }

  // BGP Enterprise Peering
  if (l3.enableBgp) {
    cli += `! --- BGP Enterprise Exterior Gateway Configuration ---\n`;
    if (vendor === 'cisco' || vendor === 'nx-os') {
      cli += `router bgp ${l3.bgpAsn || '65100'}\n`;
      if (l3.bgpRouterId) cli += ` bgp router-id ${l3.bgpRouterId}\n`;
      cli += ` bgp log-neighbor-changes\n`;
      l3.bgpNeighbors.forEach(nbr => {
        cli += ` neighbor ${nbr.ip} remote-as ${nbr.remoteAs}\n`;
        if (nbr.description) cli += ` neighbor ${nbr.ip} description "${nbr.description}"\n`;
      });
    } else if (vendor === 'arista') {
      cli += `router bgp ${l3.bgpAsn || '65100'}\n`;
      if (l3.bgpRouterId) cli += ` router-id ${l3.bgpRouterId}\n`;
      cli += ` maximum-paths 4 ecmp 4\n`;
      l3.bgpNeighbors.forEach(nbr => {
        cli += ` neighbor ${nbr.ip} remote-as ${nbr.remoteAs}\n`;
        if (nbr.description) cli += ` neighbor ${nbr.ip} description "${nbr.description}"\n`;
        cli += ` neighbor ${nbr.ip} maximum-routes 12000\n`;
      });
    } else if (vendor === 'aruba') {
      cli += `router bgp ${l3.bgpAsn || '65100'}\n`;
      if (l3.bgpRouterId) cli += ` bgp router-id ${l3.bgpRouterId}\n`;
      l3.bgpNeighbors.forEach(nbr => {
        cli += ` neighbor ${nbr.ip} remote-as ${nbr.remoteAs}\n`;
        if (nbr.description) cli += ` neighbor ${nbr.ip} description "${nbr.description}"\n`;
      });
    } else if (vendor === 'allied') {
      cli += `router bgp ${l3.bgpAsn || '65100'}\n`;
      if (l3.bgpRouterId) cli += ` bgp router-id ${l3.bgpRouterId}\n`;
      l3.bgpNeighbors.forEach(nbr => {
        cli += ` neighbor ${nbr.ip} remote-as ${nbr.remoteAs}\n`;
        if (nbr.description) cli += ` neighbor ${nbr.ip} description "${nbr.description}"\n`;
      });
    } else if (vendor === 'tplink') {
      cli += `router bgp ${l3.bgpAsn || '65100'}\n`;
      l3.bgpNeighbors.forEach(nbr => {
        cli += ` neighbor ${nbr.ip} remote-as ${nbr.remoteAs}\n`;
      });
    }
    cli += `!\n`;
  }

  // Static Routes
  if (l3.staticRoutes && l3.staticRoutes.length > 0) {
    cli += `! --- Static & Default Gateway Routing Table ---\n`;
    l3.staticRoutes.forEach(rt => {
      const ad = rt.distance && rt.distance !== '1' ? ` ${rt.distance}` : '';
      if (vendor === 'cisco' || vendor === 'nx-os' || vendor === 'tplink') {
        cli += `ip route ${rt.prefix} ${rt.mask || '255.255.255.0'} ${rt.nextHop}${ad}\n`;
      } else if (vendor === 'arista' || vendor === 'aruba' || vendor === 'allied') {
        const prefixLen = maskToPrefixLength(rt.mask || '255.255.255.0');
        cli += `ip route ${rt.prefix}/${prefixLen} ${rt.nextHop}${ad}\n`;
      }
    });
    cli += `!\n`;
  }

  cli += `end\n`;
  cli += `write memory\n`;
  return cli;
};

const getVendorName = (vendor) => {
  switch (vendor) {
    case 'juniper': return 'Juniper Junos (Enterprise Router/Switching Family)';
    case 'alcatel': return 'Alcatel-Lucent OmniSwitch AOS (Core Router Platform)';
    case 'dlink': return 'D-Link DGS/DXS (Enterprise Managed L3 Core)';
    case 'arista': return 'Arista EOS (Data Center Core)';
    case 'aruba': return 'HPE Aruba AOS-CX (Enterprise Campus)';
    case 'allied': return 'Alliedware Plus AW+ (Core Router)';
    case 'tplink': return 'TP-Link JetStream (Managed L3)';
    case 'nx-os': return 'Cisco NX-OS (Data Center Core/Nexus Series)';
    case 'cisco':
    default: return 'Cisco IOS-XE (ASR/ISR Router Series)';
  }
};

const maskToPrefixLength = (mask) => {
  if (!mask || mask === '0.0.0.0') return 0;
  if (mask.includes('/')) return mask.replace('/', '');
  const parts = mask.split('.').map(Number);
  if (parts.length !== 4) return 24;
  let cidr = 0;
  for (let part of parts) {
    if (mask === '255.255.255.0') return 24;
    let ones = part.toString(2).split('1').length - 1;
    cidr += ones;
  }
  return cidr || 24;
};
