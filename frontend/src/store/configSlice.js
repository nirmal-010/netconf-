import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  workspace: {
    activeNav: 'dashboard',
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
      'v-10': { id: 'v-10', deviceId: 'dev-01', vlanId: 10, name: 'HR', description: 'Human Resources' },
      'v-20': { id: 'v-20', deviceId: 'dev-01', vlanId: 20, name: 'SERVER', description: 'Servers' }
    },
    allIds: ['v-10', 'v-20']
  },
  interfaces: {
    byId: {
      'int-01': { 
        id: 'int-01', deviceId: 'dev-01', name: 'Gi1/0/1', description: 'Uplink to Core', 
        mode: 'trunk', accessVlan: '', trunkAllowed: '10,20', nativeVlan: '99',
        status: 'enabled', portSecurity: false, ipSourceGuard: false, stormControl: '5',
        channelGroup: '', channelMode: ''
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
  stp: {
    byId: {
      'dev-01': { deviceId: 'dev-01', mode: 'rapid-pvst' }
    },
    allIds: ['dev-01']
  }
};

export const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setWorkspaceNav: (state, action) => { state.workspace.activeNav = action.payload; },
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
      state.interfaces.byId[id] = action.payload;
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
    }
  }
});

export const { setWorkspaceNav, addVlan, updateVlan, removeVlan, addInterface, updateInterface, removeInterface, updateGlobalSecurity, updateStp } = configSlice.actions;
export default configSlice.reducer;
