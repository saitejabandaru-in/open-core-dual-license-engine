import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { EnterpriseEngine, AsymmetricLicenseManager } from '../../../packages/enterprise/src/index';

const port = process.env.PORT || 3000;

// Initialize Keypair & Engine instance
const { publicKey, privateKey } = AsymmetricLicenseManager.generateKeyPair();
AsymmetricLicenseManager.setPublicKey(publicKey);

const sampleKey = AsymmetricLicenseManager.signLicense(
  {
    licenseId: 'lic_prod_9981',
    customerName: 'Enterprise Global Corp',
    customerEmail: 'admin@enterprise.com',
    tier: 'ultimate',
    maxSeats: 250,
    maxNodes: 50,
    issuedAt: '2026-01-01',
    expiresAt: '2027-12-31',
    gracePeriodDays: 14,
  },
  privateKey
);

const app = new EnterpriseEngine(sampleKey, publicKey);

// Process sample tasks for demo metrics
app.processTask({ id: 'task_101', name: 'Database Backup', payload: {} });
app.processTask({ id: 'task_102', name: 'SAML Authentication Sync', payload: {} });
app.auditLogger?.logEvent('sec-admin@enterprise.com', 'SAML_AUTH_SUCCESS', 'usr_8819');
app.auditLogger?.logEvent('sec-admin@enterprise.com', 'RBAC_PERMISSION_GRANT', 'usr_8820');

const publicDir = path.join(__dirname, '../public');

const server = http.createServer((req, res) => {
  if (req.url === '/api/status' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(
      JSON.stringify({
        status: 'online',
        license: app.licenseResult,
        metrics: app.getMetrics(),
        auditLogs: app.auditLogger?.exportLogs() || [],
        isUnlocked: app.isEnterpriseUnlocked(),
      })
    );
    return;
  }

  if (req.url === '/metrics' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
    res.end(app.getPrometheusMetrics());
    return;
  }

  // Serve static UI Dashboard
  let filePath = path.join(publicDir, req.url === '/' ? 'index.html' : req.url!);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    const contentType = ext === '.html' ? 'text/html' : ext === '.css' ? 'text/css' : 'text/plain';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(fs.readFileSync(filePath));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 Not Found');
});

server.listen(port, () => {
  console.log(`\n🌐 [ENTERPRISE DASHBOARD LIVE] http://localhost:${port}`);
  console.log(`📊 Prometheus Metrics API: http://localhost:${port}/metrics`);
  console.log(`🔌 Status REST API: http://localhost:${port}/api/status\n`);
});
