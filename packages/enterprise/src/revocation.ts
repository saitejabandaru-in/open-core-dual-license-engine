import * as https from 'https';
import * as http from 'http';

/**
 * Online Real-Time License Revocation List (CRL / OCSP Engine)
 * 
 * Verifies if a validly signed license key has been revoked in real-time
 * due to subscription cancellation, refund, or fraud.
 */

export interface RevocationCheckResult {
  isRevoked: boolean;
  revokedAt?: string;
  reason?: string;
}

export class LicenseRevocationChecker {
  private revocationApiUrl?: string;

  constructor(revocationApiUrl?: string) {
    this.revocationApiUrl = revocationApiUrl || process.env.REVOCATION_CHECK_URL;
  }

  public async isRevoked(licenseId: string): Promise<RevocationCheckResult> {
    if (!this.revocationApiUrl) {
      // If no revocation URL configured, fall back to offline validity
      return { isRevoked: false };
    }

    try {
      const url = `${this.revocationApiUrl}?licenseId=${encodeURIComponent(licenseId)}`;
      const data = await this.httpGetJson(url);

      if (data && data.revoked === true) {
        console.warn(`⚠️ [REVOCATION ALERT] License '${licenseId}' was REVOKED online: ${data.reason}`);
        return {
          isRevoked: true,
          revokedAt: data.revokedAt,
          reason: data.reason || 'License canceled or refunded.',
        };
      }

      return { isRevoked: false };
    } catch (err: any) {
      console.warn(`[Revocation Check Warning] Could not reach online revocation server (${err.message}). Defaulting to offline Ed25519 validation.`);
      return { isRevoked: false };
    }
  }

  private httpGetJson(urlStr: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const getter = urlStr.startsWith('https') ? https.get : http.get;
      const req = getter(urlStr, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(e);
          }
        });
      });
      req.on('error', reject);
      req.setTimeout(3000, () => {
        req.destroy();
        reject(new Error('Revocation check timeout'));
      });
    });
  }
}
