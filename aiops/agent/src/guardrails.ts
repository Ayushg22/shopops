import fs from 'fs';
import path from 'path';

interface PolicyConfig {
  allowedEnvironments: string[];
  allowedServices: string[];
  allowedActions: string[];
}

export class GuardrailsEngine {
  private static loadPolicy(): PolicyConfig {
    try {
      const policyPath = path.resolve(__dirname, '../../policies/remediation-policy.json');
      if (fs.existsSync(policyPath)) {
        return JSON.parse(fs.readFileSync(policyPath, 'utf-8'));
      }
    } catch {
      // Fallback if path resolution differs
    }
    return {
      allowedEnvironments: ['dev', 'staging', 'lab'],
      allowedServices: [
        'api-gateway', 'auth-service', 'catalog-service',
        'order-service', 'inventory-service', 'payment-service', 'notification-service'
      ],
      allowedActions: ['restartDeployment', 'rollbackDeployment', 'scaleDeployment', 'pauseRollout']
    };
  }

  static isActionAllowed(action: string, targetService: string, environment: string): boolean {
    const policy = this.loadPolicy();
    const envPolicy = policy.allowedEnvironments.includes(environment);
    const servicePolicy = policy.allowedServices.includes(targetService);
    const actionPolicy = policy.allowedActions.includes(action);

    return envPolicy && servicePolicy && actionPolicy;
  }
}
