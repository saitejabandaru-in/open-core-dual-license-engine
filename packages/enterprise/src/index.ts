import { CoreEngine } from '../../core/src/index';
import { AsymmetricLicenseManager, CommercialLicensePayload, LicenseVerificationResult } from './crypto';
import { EnterpriseAuditLogger } from './audit_logger';
import { EnterpriseSSOManager, IdPType, IdentityProviderConfig, UserIdentitySession } from './sso';
import { EnterpriseRBAC } from './rbac';
import { EnterpriseTelemetry } from './telemetry';
import { EnterpriseSecretsVault, VaultConfig } from './secrets_vault';
import { LicenseRevocationChecker, RevocationCheckResult } from './revocation';

export { AsymmetricLicenseManager, CommercialLicensePayload, LicenseVerificationResult } from './crypto';
export { EnterpriseAuditLogger } from './audit_logger';
export { EnterpriseSSOManager, IdPType, IdentityProviderConfig, UserIdentitySession } from './sso';
export { EnterpriseRBAC, Role, Permission } from './rbac';
export { EnterpriseTelemetry } from './telemetry';
export { EnterpriseSecretsVault, VaultConfig } from './secrets_vault';
export { LicenseRevocationChecker, RevocationCheckResult } from './revocation';

export class EnterpriseEngine extends CoreEngine {
  public licenseResult: LicenseVerificationResult;
  public auditLogger?: EnterpriseAuditLogger;
  public ssoManager?: EnterpriseSSOManager;
  public rbac?: EnterpriseRBAC;
  public telemetry?: EnterpriseTelemetry;
  public secretsVault?: EnterpriseSecretsVault;
  public revocationChecker?: LicenseRevocationChecker;

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
        `   Operating under a ${payload.gracePeriodDays}-day grace period. Please renew your license.\n`
      );
    } else {
      console.log(
        `\n✅ [COMMERCIAL LICENSE VALIDATED] Customer: ${payload.customerName} (${payload.tier.toUpperCase()} Tier).\n` +
        `   Seats Licensed: ${payload.maxSeats} | Nodes Licensed: ${payload.maxNodes} | Days Remaining: ${this.licenseResult.daysRemaining}\n`
      );
    }

    // Initialize Production Enterprise Subsystems
    this.auditLogger = new EnterpriseAuditLogger();
    this.ssoManager = new EnterpriseSSOManager();
    this.rbac = new EnterpriseRBAC();
    this.telemetry = new EnterpriseTelemetry(payload.licenseId, payload.customerName, payload.maxNodes, payload.maxSeats);
    this.revocationChecker = new LicenseRevocationChecker();

    // Register Default Okta & Azure AD Identity Adapters
    this.ssoManager.registerProvider({
      type: 'Okta',
      entityId: 'http://www.okta.com/exk10292',
      ssoUrl: 'https://enterprise.okta.com/app/sso/saml',
      certificatePem: 'MOCK_OKTA_CERT',
    });

    this.ssoManager.registerProvider({
      type: 'AzureAD',
      entityId: 'https://sts.windows.net/tenant-id/',
      ssoUrl: 'https://login.microsoftonline.com/tenant/saml2',
      certificatePem: 'MOCK_AZURE_CERT',
    });
  }

  public isEnterpriseUnlocked(): boolean {
    return this.licenseResult.active;
  }
}
