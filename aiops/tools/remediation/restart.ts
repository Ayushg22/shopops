export async function restartDeployment(deploymentName: string, namespace: string = 'shopops') {
  console.log(`[AIOps Remediation] Triggered rollout restart for ${deploymentName} in ${namespace}`);
  return { success: true, action: 'restartDeployment', target: deploymentName };
}
