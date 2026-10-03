export async function scaleDeployment(deploymentName: string, replicas: number, namespace: string = 'shopops') {
  console.log(`[AIOps Remediation] Scaling ${deploymentName} to ${replicas} in ${namespace}`);
  return { success: true, action: 'scaleDeployment', target: deploymentName, replicas };
}
