import * as fs from 'fs';
import * as path from 'path';
import { AsymmetricLicenseManager, CommercialLicensePayload } from '../packages/enterprise/src/crypto';

/**
 * Maintainer CLI Tool: Sign Commercial License Keys for Enterprise Customers
 * 
 * Usage:
 *   npx tsx scripts/generate-license.ts "Acme Corp" "cto@acme.com" "enterprise" 50 10 365
 */

const keysDir = path.join(__dirname, '../keys');
const privateKeyPath = path.join(keysDir, 'private.pem');

if (!fs.existsSync(privateKeyPath)) {
  console.error(`❌ Private Key not found at ${privateKeyPath}. Please run 'npx tsx scripts/generate-keypair.ts' first.`);
  process.exit(1);
}

const privateKeyPem = fs.readFileSync(privateKeyPath, 'utf-8');

const args = process.argv.slice(2);
const customerName = args[0] || 'Acme Corporation';
const customerEmail = args[1] || 'billing@acme.com';
const tier = (args[2] as 'pro' | 'enterprise' | 'ultimate') || 'enterprise';
const maxSeats = parseInt(args[3] || '50', 10);
const maxNodes = parseInt(args[4] || '10', 10);
const validDays = parseInt(args[5] || '365', 10);

const now = new Date();
const expiresAt = new Date(now.getTime() + validDays * 24 * 60 * 60 * 1000);

const payload: CommercialLicensePayload = {
  licenseId: `lic_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
  customerName,
  customerEmail,
  tier,
  maxSeats,
  maxNodes,
  issuedAt: now.toISOString().split('T')[0],
  expiresAt: expiresAt.toISOString().split('T')[0],
  gracePeriodDays: 14,
};

const signedLicenseKey = AsymmetricLicenseManager.signLicense(payload, privateKeyPem);

console.log(`
===============================================================
🔑 ASYMMETRIC ENTERPRISE LICENSE KEY GENERATED
===============================================================
License ID:   ${payload.licenseId}
Customer:     ${customerName} (${customerEmail})
Tier:         ${tier.toUpperCase()}
Seats:        ${maxSeats} | Nodes: ${maxNodes}
Issued On:    ${payload.issuedAt}
Expires On:   ${payload.expiresAt} (${validDays} Days)
Grace Period: ${payload.gracePeriodDays} Days

---------------------------------------------------------------
SIGNED LICENSE KEY (PROVIDE TO CUSTOMER):
---------------------------------------------------------------
${signedLicenseKey}
---------------------------------------------------------------

Usage in Customer Application Environment:
COMMERCIAL_LICENSE_KEY="${signedLicenseKey}"
===============================================================
`);
