import { BuiltInSwarms } from '../../../packages/core/src/index';
import { EnterpriseEngine, AsymmetricLicenseManager } from '../../../packages/enterprise/src/index';

async function runInteractivePlayground() {
  console.clear();
  console.log('================================================================');
  console.log('⚡️ OPEN-CORE MULTI-AGENT SWARM ENGINE (v3.0.0-ULTIMATE)');
  console.log('================================================================\n');

  // 1. Initialize Multi-Agent Swarm
  console.log('🐝 [1/3] Spinning up Pre-built Autonomous Agent Swarm...');
  const swarm = BuiltInSwarms.createResearchAndCoderSwarm();

  // 2. Execute Swarm Task
  console.log('\n🚀 [2/3] Executing Swarm Task: "Design an Enterprise AI Architecture"');
  const swarmResult = await swarm.executeSwarm('Design an Enterprise AI Architecture with Dual Licensing');

  console.log('\n----------------------------------------------------------------');
  console.log('📋 SWARM EXECUTION RESULTS:');
  console.log('----------------------------------------------------------------');
  for (const [agentName, output] of Object.entries(swarmResult.swarmResults)) {
    console.log(`\n🤖 ${agentName}:\n${output}`);
  }

  // 3. Enterprise Dual-Licensing Engine Verification
  console.log('\n================================================================');
  console.log('🔐 [3/3] Testing Enterprise Cryptographic Engine (Ed25519)');
  console.log('================================================================');

  const { publicKey, privateKey } = AsymmetricLicenseManager.generateKeyPair();
  AsymmetricLicenseManager.setPublicKey(publicKey);

  const sampleKey = AsymmetricLicenseManager.signLicense(
    {
      licenseId: 'lic_demo_1001',
      customerName: 'Global AI Enterprise Inc',
      customerEmail: 'cto@globalai.com',
      tier: 'ultimate',
      maxSeats: 500,
      maxNodes: 100,
      issuedAt: '2026-01-01',
      expiresAt: '2027-12-31',
      gracePeriodDays: 14,
    },
    privateKey
  );

  const enterpriseApp = new EnterpriseEngine(sampleKey, publicKey);
  if (enterpriseApp.isEnterpriseUnlocked()) {
    console.log('\n🎉 ALL SYSTEMS GO: Core Swarm Engine + Enterprise Dual-Licensing Verified!');
  }
}

runInteractivePlayground();
