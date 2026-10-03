export interface DiagnosticEvidence {
  source: string;
  query: string;
  data: unknown;
}

export interface IncidentInvestigation {
  incidentId: string;
  alertName: string;
  service: string;
  evidence: DiagnosticEvidence[];
  diagnosis: string;
  recommendedAction?: string;
  status: 'INVESTIGATING' | 'REMEDIAL_ACTION_PROPOSED' | 'REMEDIATED' | 'ESCALATED';
}

export class AIOpsAgent {
  async investigate(alert: Record<string, unknown>): Promise<IncidentInvestigation> {
    return {
      incidentId: 'inc-' + Date.now(),
      alertName: String(alert.alertname || 'UnknownAlert'),
      service: String(alert.service || 'unknown'),
      evidence: [],
      diagnosis: 'Initial diagnostic assessment running against Prometheus & Loki...',
      status: 'INVESTIGATING'
    };
  }
}
