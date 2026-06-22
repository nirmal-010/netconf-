export const generateRiskReport = (validationResults, dependencyResults) => {
  const allErrors = [...validationResults.errors, ...dependencyResults.errors];
  const allWarnings = [...validationResults.warnings, ...dependencyResults.warnings];
  const passed = [];

  if (allErrors.length === 0) {
    passed.push("VLAN configurations verified.");
    passed.push("Interface dependencies validated.");
    passed.push("Security dependencies passed.");
  }

  let status = 'READY';
  if (allErrors.length > 0) {
    status = 'FAILED';
  } else if (allWarnings.length > 0) {
    status = 'WARNING';
  }

  return {
    status,
    errors: allErrors,
    warnings: allWarnings,
    passed
  };
};
