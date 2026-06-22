import { buildIosXeConfig } from '../vendors/cisco-ios-xe';
import { buildNxOsConfig } from '../vendors/cisco-nx-os';

// Note: IOS and IOS-XE share mostly the same syntax for the supported L2 features, 
// so we route them both to the IOS-XE builder for now. 
// A dedicated IOS builder can be added in the vendors folder later if L3 features diverge.

export const buildConfig = (state) => {
  const activeDevId = state.devices.activeId;
  const platform = state.devices.byId[activeDevId]?.platform || 'IOS-XE';

  switch (platform) {
    case 'NX-OS':
      return buildNxOsConfig(state);
    case 'IOS':
    case 'IOS-XE':
    default:
      return buildIosXeConfig(state);
  }
};
