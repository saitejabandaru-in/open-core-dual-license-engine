/**
 * Enterprise Feature Gate Module
 * Use this pattern to enforce commercial license validation for enterprise features.
 */

export interface LicenseValidationResult {
  isValid: boolean;
  tier: 'community' | 'pro' | 'enterprise';
  expiresAt?: Date;
  features: string[];
}

export class FeatureGate {
  private licenseKey?: string;

  constructor(licenseKey?: string) {
    this.licenseKey = licenseKey || process.env.COMMERCIAL_LICENSE_KEY;
  }

  public validateLicense(): LicenseValidationResult {
    if (!this.licenseKey) {
      return {
        isValid: false,
        tier: 'community',
        features: ['basic_core'],
      };
    }

    // Replace with offline cryptographic signature verification (JWT / RSA public key check)
    // or simple call to license server (e.g. LemonSqueezy / Polar / Custom API)
    const isEnterprise = this.licenseKey.startsWith('ENT_');

    if (isEnterprise) {
      return {
        isValid: true,
        tier: 'enterprise',
        features: ['basic_core', 'sso_saml', 'audit_logs', 'rbac', 'unlimited_throughput'],
      };
    }

    return {
      isValid: false,
      tier: 'community',
      features: ['basic_core'],
    };
  }

  public requireFeature(featureName: string): boolean {
    const status = this.validateLicense();
    if (!status.features.includes(featureName)) {
      throw new Error(
        `[Enterprise Feature Blocked] The feature '${featureName}' requires an Enterprise Commercial License. ` +
        `Visit https://yourdomain.com/enterprise to obtain a license key.`
      );
    }
    return true;
  }
}
