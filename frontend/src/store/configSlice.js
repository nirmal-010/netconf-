import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  workspace: {
    activeNav: 'l2',
    isCompiled: false,
    includeVerification: false
  },
  devices: {
    byId: {
      'dev-01': { id: 'dev-01', hostname: 'SW-CORE-01', vendor: 'Cisco', platform: 'IOS-XE', model: 'C9300' }
    },
    allIds: ['dev-01'],
    activeId: 'dev-01'
  },
  vlans: {
    byId: {
      'v-10': { id: 'v-10', deviceId: 'dev-01', vlanId: 10, name: 'HR', description: 'Human Resources', stpRoot: 'none' },
      'v-20': { id: 'v-20', deviceId: 'dev-01', vlanId: 20, name: 'SERVER', description: 'Servers', stpRoot: 'none' }
    },
    allIds: ['v-10', 'v-20']
  },
  interfaces: {
    byId: {
      'int-01': { 
        id: 'int-01', deviceId: 'dev-01', name: 'GigabitEthernet1/0/1', type: 'GigabitEthernet', number: '1/0/1', description: 'Uplink to Core', 
        mode: 'trunk', accessVlan: '', trunkAllowed: '10,20', nativeVlan: '99',
        status: 'enabled', speed: 'auto', duplex: 'auto', portSecurity: false, ipSourceGuard: false, stormControl: '5',
        channelGroup: '', channelMode: '', voiceVlan: '',
        dtp: true, portfast: false, bpduGuard: 'default', poe: 'auto', udld: 'enable',
        portSecMax: 1, portSecViolation: 'restrict', portSecSticky: false,
        dhcpSnoopingTrust: true, daiTrust: true
      }
    },
    allIds: ['int-01']
  },
  globalSecurity: {
    byId: {
      'dev-01': { deviceId: 'dev-01', dhcpSnooping: true, dai: true, bpduGuard: true, rootGuard: false, loopGuard: false }
    },
    allIds: ['dev-01']
  },
  globalL2: {
    byId: {
      'dev-01': { 
        deviceId: 'dev-01', vtpMode: 'transparent', vtpDomain: '', vtpPassword: '', vtpVersion: '2',
        macAging: 300, errdisableRecovery: false, errdisableInterval: 300
      }
    },
    allIds: ['dev-01']
  },
  stp: {
    byId: {
      'dev-01': { deviceId: 'dev-01', mode: 'rapid-pvst' }
    },
    allIds: ['dev-01']
  },
  l3: {
    byId: {
      'dev-01': {
        deviceId: 'dev-01',
        routingVendor: 'cisco', // cisco, arista, aruba, allied, tplink
        enableOspf: true,
        ospfProcessId: '100',
        ospfRouterId: '1.1.1.1',
        ospfNetworks: [
          { id: 'net-101', network: '10.10.0.0', wildcard: '0.0.0.255', area: '0' },
          { id: 'net-102', network: '172.16.20.0', wildcard: '0.0.0.255', area: '1' }
        ],
        enableBgp: true,
        bgpAsn: '65100',
        bgpRouterId: '1.1.1.1',
        bgpNeighbors: [
          { id: 'nbr-101', ip: '10.10.0.2', remoteAs: '65200', description: 'Core-Upstream-Router' }
        ],
        staticRoutes: [
          { id: 'rt-101', prefix: '0.0.0.0', mask: '0.0.0.0', nextHop: '192.168.1.254', distance: '1' }
        ]
      }
    },
    allIds: ['dev-01']
  }
};

export const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setWorkspaceNav: (state, action) => { state.workspace.activeNav = action.payload; },
    setCompiledState: (state, action) => { state.workspace.isCompiled = action.payload; },
    setVerificationToggle: (state, action) => { state.workspace.includeVerification = action.payload; },
    updateDevice: (state, action) => {
      const { id, updates } = action.payload;
      if (state.devices.byId[id]) {
        state.devices.byId[id] = { ...state.devices.byId[id], ...updates };
      }
    },
    addDevice: (state, action) => {
      const device = action.payload;
      const id = device.id || `dev-${Date.now()}`;
      state.devices.byId[id] = { id, hostname: device.hostname || 'NEW-DEVICE', vendor: device.vendor || 'Cisco', platform: device.platform || 'IOS-XE', model: device.model || 'Standard Enterprise Switch', role: device.role || 'Access Leaf', ip: device.ip || '10.255.0.100', firmware: device.firmware || 'Production Stable', poe: device.poe || 'N/A', ...device };
      if (!state.devices.allIds.includes(id)) {
        state.devices.allIds.push(id);
      }
      state.devices.activeId = id;

      // Initialize defaults for this device
      if (state.globalSecurity && state.globalSecurity.byId) {
        state.globalSecurity.byId[id] = { deviceId: id, dhcpSnooping: true, dai: true, bpduGuard: true, rootGuard: false, loopGuard: false };
        if (!state.globalSecurity.allIds.includes(id)) state.globalSecurity.allIds.push(id);
      }
      if (state.globalL2 && state.globalL2.byId) {
        state.globalL2.byId[id] = { deviceId: id, vtpMode: 'transparent', vtpDomain: '', vtpPassword: '', vtpVersion: '2', macAging: 300, errdisableRecovery: false, errdisableInterval: 300 };
        if (!state.globalL2.allIds.includes(id)) state.globalL2.allIds.push(id);
      }
      if (state.stp && state.stp.byId) {
        state.stp.byId[id] = { deviceId: id, mode: 'rapid-pvst' };
        if (!state.stp.allIds.includes(id)) state.stp.allIds.push(id);
      }
      if (state.l3 && state.l3.byId) {
        state.l3.byId[id] = { deviceId: id, routingVendor: (device.vendor || 'cisco').toLowerCase(), enableOspf: false, ospfProcessId: '100', ospfRouterId: '1.1.1.1', ospfNetworks: [], enableBgp: false, bgpAsn: '65100', bgpRouterId: '1.1.1.1', bgpNeighbors: [], staticRoutes: [] };
        if (!state.l3.allIds.includes(id)) state.l3.allIds.push(id);
      }
    },
    removeDevice: (state, action) => {
      const id = action.payload;
      delete state.devices.byId[id];
      state.devices.allIds = state.devices.allIds.filter(dId => dId !== id);
      if (state.devices.activeId === id && state.devices.allIds.length > 0) {
        state.devices.activeId = state.devices.allIds[0];
      }
    },
    addVlan: (state, action) => {
      const { id } = action.payload;
      state.vlans.byId[id] = action.payload;
      if (!state.vlans.allIds.includes(id)) state.vlans.allIds.push(id);
    },
    updateVlan: (state, action) => {
      const { id, updates } = action.payload;
      if (state.vlans.byId[id]) {
        state.vlans.byId[id] = { ...state.vlans.byId[id], ...updates };
      }
    },
    removeVlan: (state, action) => {
      const id = action.payload;
      delete state.vlans.byId[id];
      state.vlans.allIds = state.vlans.allIds.filter(v => v !== id);
    },
    addInterface: (state, action) => {
      const { id } = action.payload;
      state.interfaces.byId[id] = { 
        type: 'GigabitEthernet', number: '', name: 'GigabitEthernet',
        speed: 'auto', duplex: 'auto', voiceVlan: '', 
        dtp: true, portfast: false, bpduGuard: 'default', poe: 'auto', udld: 'enable',
        portSecMax: 1, portSecViolation: 'restrict', portSecSticky: false,
        dhcpSnoopingTrust: false, daiTrust: false,
        ...action.payload 
      };
      if (!state.interfaces.allIds.includes(id)) state.interfaces.allIds.push(id);
    },
    updateInterface: (state, action) => {
      const { id, updates } = action.payload;
      if (state.interfaces.byId[id]) {
        state.interfaces.byId[id] = { ...state.interfaces.byId[id], ...updates };
      }
    },
    removeInterface: (state, action) => {
      const id = action.payload;
      delete state.interfaces.byId[id];
      state.interfaces.allIds = state.interfaces.allIds.filter(i => i !== id);
    },
    updateGlobalSecurity: (state, action) => {
      const { deviceId, updates } = action.payload;
      if (!state.globalSecurity.byId[deviceId]) {
        state.globalSecurity.byId[deviceId] = { deviceId };
        state.globalSecurity.allIds.push(deviceId);
      }
      state.globalSecurity.byId[deviceId] = { ...state.globalSecurity.byId[deviceId], ...updates };
    },
    updateStp: (state, action) => {
      const { deviceId, updates } = action.payload;
      if (!state.stp.byId[deviceId]) {
        state.stp.byId[deviceId] = { deviceId };
        state.stp.allIds.push(deviceId);
      }
      state.stp.byId[deviceId] = { ...state.stp.byId[deviceId], ...updates };
    },
    updateGlobalL2: (state, action) => {
      const { deviceId, updates } = action.payload;
      if (!state.globalL2.byId[deviceId]) {
        state.globalL2.byId[deviceId] = { deviceId };
        state.globalL2.allIds.push(deviceId);
      }
      state.globalL2.byId[deviceId] = { ...state.globalL2.byId[deviceId], ...updates };
    },
    updateL3: (state, action) => {
      if (!state.l3) state.l3 = { byId: {}, allIds: [] };
      const payload = action.payload || {};
      const deviceId = payload.deviceId || state.devices?.activeId || 'dev-01';
      if (!state.l3.byId[deviceId]) {
        state.l3.byId[deviceId] = {
          deviceId, routingVendor: 'cisco', enableOspf: false, ospfProcessId: '100', ospfRouterId: '1.1.1.1', ospfNetworks: [],
          enableBgp: false, bgpAsn: '65100', bgpRouterId: '1.1.1.1', bgpNeighbors: [], staticRoutes: []
        };
        if (!state.l3.allIds.includes(deviceId)) state.l3.allIds.push(deviceId);
      }
      state.l3.byId[deviceId] = { ...state.l3.byId[deviceId], ...payload };
    },
    addOspfNetwork: (state, action) => {
      if (!state.l3) state.l3 = { byId: {}, allIds: [] };
      const { deviceId = state.devices?.activeId || 'dev-01', network } = action.payload || {};
      if (!state.l3.byId[deviceId]) {
        state.l3.byId[deviceId] = {
          deviceId, routingVendor: 'cisco', enableOspf: true, ospfProcessId: '100', ospfRouterId: '1.1.1.1', ospfNetworks: [],
          enableBgp: false, bgpAsn: '65100', bgpRouterId: '1.1.1.1', bgpNeighbors: [], staticRoutes: []
        };
        if (!state.l3.allIds.includes(deviceId)) state.l3.allIds.push(deviceId);
      }
      state.l3.byId[deviceId].ospfNetworks.push(network);
    },
    removeOspfNetwork: (state, action) => {
      if (!state.l3 || !state.l3.byId) return;
      const { deviceId = state.devices?.activeId || 'dev-01', id } = action.payload || {};
      if (state.l3.byId[deviceId] && state.l3.byId[deviceId].ospfNetworks) {
        state.l3.byId[deviceId].ospfNetworks = state.l3.byId[deviceId].ospfNetworks.filter(n => n.id !== id);
      }
    },
    addBgpNeighbor: (state, action) => {
      if (!state.l3) state.l3 = { byId: {}, allIds: [] };
      const { deviceId = state.devices?.activeId || 'dev-01', neighbor } = action.payload || {};
      if (!state.l3.byId[deviceId]) {
        state.l3.byId[deviceId] = {
          deviceId, routingVendor: 'cisco', enableOspf: false, ospfProcessId: '100', ospfRouterId: '1.1.1.1', ospfNetworks: [],
          enableBgp: true, bgpAsn: '65100', bgpRouterId: '1.1.1.1', bgpNeighbors: [], staticRoutes: []
        };
        if (!state.l3.allIds.includes(deviceId)) state.l3.allIds.push(deviceId);
      }
      state.l3.byId[deviceId].bgpNeighbors.push(neighbor);
    },
    removeBgpNeighbor: (state, action) => {
      if (!state.l3 || !state.l3.byId) return;
      const { deviceId = state.devices?.activeId || 'dev-01', id } = action.payload || {};
      if (state.l3.byId[deviceId] && state.l3.byId[deviceId].bgpNeighbors) {
        state.l3.byId[deviceId].bgpNeighbors = state.l3.byId[deviceId].bgpNeighbors.filter(n => n.id !== id);
      }
    },
    addStaticRoute: (state, action) => {
      if (!state.l3) state.l3 = { byId: {}, allIds: [] };
      const { deviceId = state.devices?.activeId || 'dev-01', route } = action.payload || {};
      if (!state.l3.byId[deviceId]) {
        state.l3.byId[deviceId] = {
          deviceId, routingVendor: 'cisco', enableOspf: false, ospfProcessId: '100', ospfRouterId: '1.1.1.1', ospfNetworks: [],
          enableBgp: false, bgpAsn: '65100', bgpRouterId: '1.1.1.1', bgpNeighbors: [], staticRoutes: []
        };
        if (!state.l3.allIds.includes(deviceId)) state.l3.allIds.push(deviceId);
      }
      state.l3.byId[deviceId].staticRoutes.push(route);
    },
    removeStaticRoute: (state, action) => {
      if (!state.l3 || !state.l3.byId) return;
      const { deviceId = state.devices?.activeId || 'dev-01', id } = action.payload || {};
      if (state.l3.byId[deviceId] && state.l3.byId[deviceId].staticRoutes) {
        state.l3.byId[deviceId].staticRoutes = state.l3.byId[deviceId].staticRoutes.filter(r => r.id !== id);
      }
    },
    setActiveDevice: (state, action) => {
      if (state.devices) {
        state.devices.activeId = action.payload;
      }
    },
    hydrateState: (state, action) => {
      const payload = action.payload || {};
      return {
        ...initialState,
        ...payload,
        workspace: { ...initialState.workspace, ...(payload.workspace || {}) },
        devices: { ...initialState.devices, ...(payload.devices || {}) },
        vlans: { ...initialState.vlans, ...(payload.vlans || {}) },
        interfaces: { ...initialState.interfaces, ...(payload.interfaces || {}) },
        globalSecurity: { ...initialState.globalSecurity, ...(payload.globalSecurity || {}) },
        globalL2: { ...initialState.globalL2, ...(payload.globalL2 || {}) },
        stp: { ...initialState.stp, ...(payload.stp || {}) },
        l3: { ...initialState.l3, ...(payload.l3 || {}) }
      };
    }
  }
});

export const { setWorkspaceNav, setActiveDevice, setCompiledState, setVerificationToggle, addDevice, updateDevice, removeDevice, addVlan, updateVlan, removeVlan, addInterface, updateInterface, removeInterface, updateGlobalSecurity, updateStp, updateGlobalL2, updateL3, addOspfNetwork, removeOspfNetwork, addBgpNeighbor, removeBgpNeighbor, addStaticRoute, removeStaticRoute, hydrateState } = configSlice.actions;
export default configSlice.reducer;
