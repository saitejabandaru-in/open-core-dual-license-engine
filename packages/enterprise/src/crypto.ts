import * as crypto from 'crypto';

/**
 * Production Asymmetric Cryptography (Ed25519 / RSA) for License Management
 * 
 * Public key is shipped inside the application binary/package.
 * Private key is kept SECRET by the maintainer to issue signed licenses.
 */

export interface CommercialLicensePayload {
  licenseId: string;
  customerName: string;
  customerEmail: string;
  domainName?: string;
  maxSeats: number;
  maxNodes: number;
  tier: 'pro' | 'enterprise' | 'ultimate';
  issuedAt: string;
  expiresAt: string;
  gracePeriodDays: number;
}

export interface LicenseVerificationResult {
  valid: boolean;
  active: boolean;
  inGracePeriod: boolean;
  daysRemaining: number;
  payload?: CommercialLicensePayload;
  reason?: string;
}

export class AsymmetricLicenseManager {
  /**
   * Embed your public key here (PEM format).
   * Anyone can verify signatures with this public key, but only you can sign with your private key.
   */
  private static PUBLIC_KEY_PEM: string = '';

  /**
   * Initialize with custom Public Key or load default embedded Public Key
   */
  public static setPublicKey(publicKeyPem: string): void {
    this.PUBLIC_KEY_PEM = publicKeyPem;
  }

  /**
   * Generate an Asymmetric Key Pair (ED25519)
   */
  public static generateKeyPair(): { publicKey: string; privateKey: string } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    return { publicKey, privateKey };
  }

  /**
   * Sign a license payload using the Maintainer's Secret Private Key
   */
  public static signLicense(payload: CommercialLicensePayload, privateKeyPem: string): string {
    const jsonPayload = JSON.stringify(payload);
    const payloadB64 = Buffer.from(jsonPayload, 'utf-8').toString('base64url');

    const signature = crypto.sign(null, Buffer.from(payloadB64), privateKeyPem).toString('base64url');

    return `${payloadB64}.${signature}`;
  }

  /**
   * Verify a license key using the Embedded Public Key
   */
  public static verifyLicense(licenseKey: string, publicKeyPem?: string): LicenseVerificationResult {
    const keyToUse = publicKeyPem || this.PUBLIC_KEY_PEM;

    if (!keyToUse) {
      return { valid: false, active: false, inGracePeriod: false, daysRemaining: 0, reason: 'Public Key not configured in enterprise engine.' };
    }

    if (!licenseKey || typeof licenseKey !== 'string') {
      return { valid: false, active: false, inGracePeriod: false, daysRemaining: 0, reason: 'License key is missing or invalid type.' };
    }

    const parts = licenseKey.trim().split('.');
    if (parts.length !== 2) {
      return { valid: false, active: false, inGracePeriod: false, daysRemaining: 0, reason: 'Invalid license key format. Expected <payload>.<signature>' };
    }

    const [payloadB64, signatureB64] = parts;

    try {
      // 1. Verify Asymmetric Ed25519 Signature
      const isValidSig = crypto.verify(
        null,
        Buffer.from(payloadB64),
        keyToUse,
        Buffer.from(signatureB64, 'base64url')
      );

      if (!isValidSig) {
        return { valid: false, active: false, inGracePeriod: false, daysRemaining: 0, reason: 'Cryptographic signature verification failed! License key has been tampered with or forged.' };
      }

      // 2. Parse Payload
      const jsonStr = Buffer.from(payloadB64, 'base64url').toString('utf-8');
      const payload: CommercialLicensePayload = JSON.parse(jsonStr);

      // 3. Date & Grace Period Calculations
      const now = new Date();
      const expirationDate = new Date(payload.expiresAt);
      const gracePeriodEnd = new Date(expirationDate.getTime() + (payload.gracePeriodDays || 14) * 24 * 60 * 60 * 1000);

      const diffTime = expirationDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const isExpired = now > expirationDate;
      const isPastGrace = now > gracePeriodEnd;

      if (isPastGrace) {
        return {
          valid: true,
          active: false,
          inGracePeriod: false,
          daysRemaining,
          payload,
          reason: `License expired on ${payload.expiresAt} and grace period ended on ${gracePeriodEnd.toISOString().split('T')[0]}.`,
        };
      }

      const inGracePeriod = isExpired && !isPastGrace;

      return {
        valid: true,
        active: true,
        inGracePeriod,
        daysRemaining,
        payload,
      };
    } catch (err: any) {
      return { valid: false, active: false, inGracePeriod: false, daysRemaining: 0, reason: `Failed to decode license payload: ${err.message}` };
    }
  }
}
