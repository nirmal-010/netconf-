import { buildIosXeConfig } from '../vendors/cisco-ios-xe';
import { buildNxOsConfig } from '../vendors/cisco-nx-os';
import { buildAristaEOS } from '../vendors/arista-eos';
import { buildJuniperJunos } from '../vendors/juniper-junos';
import { buildAOSCX } from '../vendors/hpe-aruba';
import { buildAlliedTelesis } from '../vendors/allied-telesis';
import { buildAlcatelOmniSwitch } from '../vendors/alcatel-omniswitch';
import { buildTPLink } from '../vendors/tp-link';
import { buildDLink } from '../vendors/d-link';
import { buildL3Config } from './l3Builder';

export const buildConfig = (state) => {
  if (state.workspace?.activeNav === 'l3') {
    return buildL3Config(state);
  }

  const activeDevId = state.devices?.activeId || 'dev-01';
  const platform = state.devices?.byId?.[activeDevId]?.platform || 'IOS-XE';

  switch (platform) {
    case 'IOS-XE':
      return buildIosXeConfig(state);
    case 'NX-OS':
      return buildNxOsConfig(state);
    case 'EOS':
      return buildAristaEOS(state);
    case 'JUNOS':
      return buildJuniperJunos(state);
    case 'AOS-CX':
      return buildAOSCX(state);
    case 'AW+':
      return buildAlliedTelesis(state);
    case 'AOS':
      return buildAlcatelOmniSwitch(state);
    case 'JetStream':
      return buildTPLink(state);
    case 'D-Link':
      return buildDLink(state);
    default:
      return buildIosXeConfig(state);
  }
};
