import * as os from 'os';
import * as crypto from 'crypto';

/**
 * Machine & Environment Hardware Fingerprinting Module
 * Allows enterprise customers to optionally bind license keys to specific domains or host MAC addresses.
 */

export interface SystemFingerprint {
  hostname: string;
  platform: string;
  arch: string;
  cpus: number;
  macHash: string;
  fingerprintId: string;
}

export class HardwareFingerprint {
  public static getFingerprint(): SystemFingerprint {
    const hostname = os.hostname();
    const platform = os.platform();
    const arch = os.arch();
    const cpus = os.cpus().length;

    // Collect network interface MAC addresses safely
    const interfaces = os.networkInterfaces();
    const macs: string[] = [];

    for (const name of Object.keys(interfaces)) {
      for (const net of interfaces[name] || []) {
        if (!net.internal && net.mac && net.mac !== '00:00:00:00:00:00') {
          macs.push(net.mac);
        }
      }
    }

    macs.sort();
    const rawString = `${hostname}:${platform}:${arch}:${cpus}:${macs.join(',')}`;
    const fingerprintId = crypto.createHash('sha256').update(rawString).digest('hex').substring(0, 32);
    const macHash = crypto.createHash('sha256').update(macs.join(',')).digest('hex').substring(0, 16);

    return {
      hostname,
      platform,
      arch,
      cpus,
      macHash,
      fingerprintId,
    };
  }

  public static verifyBinding(allowedFingerprint?: string): boolean {
    if (!allowedFingerprint) return true; // No hardware lock required
    const current = this.getFingerprint();
    return current.fingerprintId === allowedFingerprint;
  }
}
