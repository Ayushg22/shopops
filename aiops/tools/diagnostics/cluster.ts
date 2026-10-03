export async function getClusterHealth() {
  return { status: 'healthy', nodeCount: 3, podCount: 24 };
}

export async function getPods(namespace: string = 'shopops') {
  return [{ name: 'order-service-7f8d9b-abc', status: 'Running', restarts: 0 }];
}
