import * as crypto from 'crypto';

export interface LicenseData {
  companyName: string;
  customerEmail: string;
  tier: 'pro' | 'enterprise';
  issuedAt: string;
  expiresAt: string;
}

export class LicenseVerifier {
  // Use a secret salt/private key set by the project maintainer
  private static readonly SECRET_KEY = process.env.COMMERCIAL_LICENSE_SECRET || 'MONETIZATION_SECRET_KEY_CHANGE_IN_PRODUCTION';

  /**
   * Verifies an encoded license key string.
   * Format: base64(payload).signature
   */
  public static verify(licenseKey: string): { valid: boolean; data?: LicenseData; reason?: string } {
    if (!licenseKey) {
      return { valid: false, reason: 'License key is missing.' };
    }

    const parts = licenseKey.trim().split('.');
    if (parts.length !== 2) {
      return { valid: false, reason: 'Invalid license key format.' };
    }

    const [payloadB64, signature] = parts;

    // Verify HMAC signature
    const expectedSig = crypto
      .createHmac('sha256', this.SECRET_KEY)
      .update(payloadB64)
      .digest('hex');

    if (expectedSig !== signature) {
      return { valid: false, reason: 'License key signature invalid or tampered.' };
    }

    try {
      const jsonStr = Buffer.from(payloadB64, 'base64').toString('utf-8');
      const data: LicenseData = JSON.parse(jsonStr);

      const now = new Date();
      const expires = new Date(data.expiresAt);

      if (now > expires) {
        return { valid: false, data, reason: `License key expired on ${data.expiresAt}.` };
      }

      return { valid: true, data };
    } catch (e: any) {
      return { valid: false, reason: 'Failed to parse license payload.' };
    }
  }

  /**
   * Helper function for the maintainer CLI to issue signed licenses.
   */
  public static generate(data: LicenseData): string {
    const payloadB64 = Buffer.from(JSON.stringify(data)).toString('base64');
    const signature = crypto
      .createHmac('sha256', this.SECRET_KEY)
      .update(payloadB64)
      .digest('hex');

    return `${payloadB64}.${signature}`;
  }
}
