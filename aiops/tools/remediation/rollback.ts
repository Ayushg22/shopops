export async function rollbackDeployment(deploymentName: string, namespace: string = 'shopops') {
  console.log(`[AIOps Remediation] Rolling back deployment ${deploymentName} in ${namespace}`);
  return { success: true, action: 'rollbackDeployment', target: deploymentName };
}
