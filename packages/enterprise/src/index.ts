import { CoreEngine } from '../../core/src/index';
import { AsymmetricLicenseManager, CommercialLicensePayload, LicenseVerificationResult } from './crypto';
import { EnterpriseAuditLogger } from './audit_logger';
import { EnterpriseSSOProvider } from './sso';
import { EnterpriseRBAC } from './rbac';
import { EnterpriseTelemetry } from './telemetry';

export { AsymmetricLicenseManager, CommercialLicensePayload, LicenseVerificationResult } from './crypto';
export { EnterpriseAuditLogger } from './audit_logger';
export { EnterpriseSSOProvider } from './sso';
export { EnterpriseRBAC, Role, Permission } from './rbac';
export { EnterpriseTelemetry } from './telemetry';

export class EnterpriseEngine extends CoreEngine {
  public licenseResult: LicenseVerificationResult;
  public auditLogger?: EnterpriseAuditLogger;
  public ssoProvider?: EnterpriseSSOProvider;
  public rbac?: EnterpriseRBAC;
  public telemetry?: EnterpriseTelemetry;

  constructor(licenseKey?: string, publicKeyPem?: string) {
    super();

    const key = licenseKey || process.env.COMMERCIAL_LICENSE_KEY || '';
    this.licenseResult = AsymmetricLicenseManager.verifyLicense(key, publicKeyPem);

    if (!this.licenseResult.active) {
      console.warn(
        `\n⚠️  [COMMERCIAL LICENSE WARNING] Enterprise features locked: ${this.licenseResult.reason || 'No active commercial license.'}\n` +
        `   Running in Community Mode (AGPL-3.0).\n` +
        `   To unlock Enterprise features (SSO/SAML, Audit Logs, RBAC, Node Scaling), purchase a commercial license at:\n` +
        `   👉 https://yourdomain.com/enterprise\n`
      );
      return;
    }

    const payload = this.licenseResult.payload!;

    if (this.licenseResult.inGracePeriod) {
      console.warn(
        `\n⚠️  [LICENSE GRACE PERIOD NOTICE] Your commercial license expired on ${payload.expiresAt}.\n` +
        `   You are operating under a ${payload.gracePeriodDays}-day grace period. Please renew your license to avoid service interruption.\n`
      );
    } else {
      console.log(
        `\n✅ [COMMERCIAL LICENSE VALIDATED] Customer: ${payload.customerName} (${payload.tier.toUpperCase()} Tier).\n` +
        `   Seats Licensed: ${payload.maxSeats} | Nodes Licensed: ${payload.maxNodes} | Days Remaining: ${this.licenseResult.daysRemaining}\n`
      );
    }

    // Initialize Enterprise Production Plugins
    this.auditLogger = new EnterpriseAuditLogger();
    this.ssoProvider = new EnterpriseSSOProvider();
    this.rbac = new EnterpriseRBAC();
    this.telemetry = new EnterpriseTelemetry(payload.licenseId, payload.customerName, payload.maxNodes, payload.maxSeats);
  }

  public isEnterpriseUnlocked(): boolean {
    return this.licenseResult.active;
  }
}
