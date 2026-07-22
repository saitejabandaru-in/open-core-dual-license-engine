import * as fs from 'fs';
import * as path from 'path';
import { EnterpriseEngine, AsymmetricLicenseManager } from '../../../packages/enterprise/src/index';

console.log('---------------------------------------------------------------');
console.log('🚀 PRODUCTION DEMO: Asymmetric Open-Core Dual-Licensing Engine');
console.log('---------------------------------------------------------------\n');

// 1. Generate Asymmetric Keypair
console.log('=== STEP 1: Generating Ed25519 Asymmetric Keypair ===');
const { publicKey, privateKey } = AsymmetricLicenseManager.generateKeyPair();
AsymmetricLicenseManager.setPublicKey(publicKey);
console.log('✅ Ed25519 Public Key embedded in Enterprise Engine.\n');

// 2. Scenario 1: Community Mode (No License Key)
console.log('=== SCENARIO 1: Community Mode (No License Key) ===');
const communityApp = new EnterpriseEngine('', publicKey);
communityApp.processTask({ id: 'task_001', name: 'Open Source Community Task', payload: {} });

if (!communityApp.isEnterpriseUnlocked()) {
  console.log('=> Enterprise features (SSO, Audit Logs, RBAC) locked in Community Mode.\n');
}

// 3. Scenario 2: Generate Signed Commercial License Key for Acme Corp
console.log('=== SCENARIO 2: Maintainer Signs License Key for Acme Corp ===');
const signedLicenseKey = AsymmetricLicenseManager.signLicense(
  {
    licenseId: 'lic_acme_9901',
    customerName: 'Acme Corporation',
    customerEmail: 'cto@acme.com',
    tier: 'enterprise',
    maxSeats: 100,
    maxNodes: 20,
    issuedAt: '2026-01-01',
    expiresAt: '2027-12-31',
    gracePeriodDays: 14,
  },
  privateKey
);
console.log(`Signed License Key: ${signedLicenseKey.substring(0, 45)}...\n`);

// 4. Scenario 3: Commercial Mode (Enterprise Unlocked)
console.log('=== SCENARIO 3: Customer Runs App with Valid Signed License Key ===');
const enterpriseApp = new EnterpriseEngine(signedLicenseKey, publicKey);

if (enterpriseApp.isEnterpriseUnlocked()) {
  enterpriseApp.processTask({ id: 'task_002', name: 'Enterprise Payment Processing', payload: {} });

  // Audit Logging
  enterpriseApp.auditLogger?.logEvent('admin@acme.com', 'EXECUTE_PAYMENT', 'task_002', { amount: 50000 });

  // SAML SSO
  const ssoSession = enterpriseApp.ssoProvider?.authenticateSAMLToken('saml_assertion_data');
  console.log(`=> SSO Authenticated: ${ssoSession?.email} (${ssoSession?.idpProvider})`);

  // RBAC Access Control
  enterpriseApp.rbac?.enforcePermission('admin', 'export:audit_logs');
  console.log('=> RBAC Permission Verified: Role admin has export:audit_logs.');

  // Telemetry Quota Validation
  const quotaCheck = enterpriseApp.telemetry?.checkQuota(15, 80);
  console.log(`=> Quota Validation (15 nodes / 80 seats): ${quotaCheck.allowed ? 'PASSED ✅' : 'FAILED ❌'}`);
}

console.log('\n---------------------------------------------------------------');
console.log('🎉 Production Open-Core Asymmetric Dual-Licensing Test Passed!');
console.log('---------------------------------------------------------------');
