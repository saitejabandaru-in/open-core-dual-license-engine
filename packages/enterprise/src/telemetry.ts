/**
 * Enterprise Telemetry & License Node Count Validator
 */

export interface TelemetryReport {
  licenseId: string;
  customerName: string;
  activeNodes: number;
  activeSeats: number;
  environment: string;
  timestamp: string;
}

export class EnterpriseTelemetry {
  private licenseId: string;
  private customerName: string;
  private maxNodes: number;
  private maxSeats: number;

  constructor(licenseId: string, customerName: string, maxNodes: number, maxSeats: number) {
    this.licenseId = licenseId;
    this.customerName = customerName;
    this.maxNodes = maxNodes;
    this.maxSeats = maxSeats;
  }

  public checkQuota(currentNodes: number, currentSeats: number): { allowed: boolean; warning?: string } {
    if (currentNodes > this.maxNodes) {
      return {
        allowed: false,
        warning: `[NODE QUOTA EXCEEDED] Current active nodes (${currentNodes}) exceeds licensed limit (${this.maxNodes}). Contact sales to upgrade your node quota.`,
      };
    }

    if (currentSeats > this.maxSeats) {
      return {
        allowed: false,
        warning: `[SEAT QUOTA EXCEEDED] Current active seats (${currentSeats}) exceeds licensed limit (${this.maxSeats}). Contact sales to purchase additional user seats.`,
      };
    }

    return { allowed: true };
  }

  public generateReport(currentNodes: number, currentSeats: number): TelemetryReport {
    return {
      licenseId: this.licenseId,
      customerName: this.customerName,
      activeNodes: currentNodes,
      activeSeats: currentSeats,
      environment: process.env.NODE_ENV || 'production',
      timestamp: new Date().toISOString(),
    };
  }
}
