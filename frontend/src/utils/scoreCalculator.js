export const calculateReadinessScore = (config) => {
  let score = 100;
  const activeDevId = config.devices.activeId;
  const security = config.globalSecurity.byId[activeDevId] || {};
  const interfaces = config.interfaces.allIds.map(id => config.interfaces.byId[id]).filter(i => i.deviceId === activeDevId);

  if (!security.dhcpSnooping) score -= 30;
  if (!security.dai) score -= 25;
  if (!security.bpduGuard) score -= 20;
  
  const hasAccessPorts = interfaces.some(i => i.mode === 'access');
  if (hasAccessPorts) {
    const hasPortSec = interfaces.some(i => i.mode === 'access' && i.portSecurity);
    if (!hasPortSec) score -= 15;
  }

  if (interfaces.length > 0) {
    const hasStormControl = interfaces.some(i => i.stormControl > 0);
    if (!hasStormControl) score -= 10;
  }

  return { score: Math.max(0, score) };
};
