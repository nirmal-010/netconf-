import { validateVlans } from './validators/vlanValidator';
import { validateInterfaces } from './validators/interfaceValidator';
import { validateSecurity } from './validators/securityValidator';
import { checkDependencies } from './dependencies/dependencyEngine';
import { generateRiskReport } from './reports/riskAnalyzer';
import { buildConfig } from './builders/cliBuilder';
import { buildVerificationCommands } from './builders/verificationBuilder';

export const compileConfiguration = (state) => {
  const activeDevId = state.devices.activeId;
  const vlans = state.vlans.allIds.map(id => state.vlans.byId[id]).filter(v => v.deviceId === activeDevId);
  const interfaces = state.interfaces.allIds.map(id => state.interfaces.byId[id]).filter(i => i.deviceId === activeDevId);
  const security = state.globalSecurity.byId[activeDevId] || {};

  // 1. Validation Engine
  const vlanValidation = validateVlans(vlans, interfaces);
  const interfaceValidation = validateInterfaces(interfaces, vlans);
  const securityValidation = validateSecurity(security, interfaces);

  const validationResults = {
    errors: [...vlanValidation.errors, ...interfaceValidation.errors, ...securityValidation.errors],
    warnings: [...vlanValidation.warnings, ...interfaceValidation.warnings, ...securityValidation.warnings]
  };

  // 2. Dependency Engine
  const dependencyResults = checkDependencies(state);

  // 3. Risk Analyzer
  const report = generateRiskReport(validationResults, dependencyResults);

  // 4. Configuration Builder
  let cli = '';
  if (report.status !== 'FAILED') {
    cli = buildConfig(state);
    
    // 5. Verification Commands
    if (state.workspace.includeVerification) {
      cli += buildVerificationCommands(state);
    }
  } else {
    cli = "! COMPILATION FAILED\n! Please resolve the configuration errors above to generate the CLI.";
  }

  return { report, cli };
};
