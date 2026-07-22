import * as fs from 'fs';
import * as path from 'path';
import { AsymmetricLicenseManager } from '../packages/enterprise/src/crypto';

/**
 * Maintainer CLI Tool: Generate Asymmetric Ed25519 Keypair
 */

const keysDir = path.join(__dirname, '../keys');

if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir, { recursive: true });
}

const { publicKey, privateKey } = AsymmetricLicenseManager.generateKeyPair();

fs.writeFileSync(path.join(keysDir, 'public.pem'), publicKey, 'utf-8');
fs.writeFileSync(path.join(keysDir, 'private.pem'), privateKey, 'utf-8');

console.log(`
===============================================================
🔐 ED25519 ASYMMETRIC KEYPAIR GENERATED
===============================================================
Public Key:  ${path.join(keysDir, 'public.pem')} (Ship this with @open-core/enterprise)
Private Key: ${path.join(keysDir, 'private.pem')} (KEEP THIS SECRET! Use only to sign licenses)
===============================================================
`);
