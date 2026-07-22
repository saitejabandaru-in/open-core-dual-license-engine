# Engine 1: Production Open-Core Dual-Licensing Monorepo

This repository contains an enterprise-grade, production-ready implementation of **Engine 1 (Open-Core & Dual Licensing)**. It uses **Ed25519 Asymmetric Cryptography**, offline signature validation, seat/node quota enforcers, SAML/SSO plugins, and compliance audit loggers.

---

## 🏗 Monorepo Architecture

```
engine1-open-core/
├── packages/
│   ├── core/                        # AGPL-3.0 Free Open-Source Engine
│   └── enterprise/                  # Commercial Closed-Source Module (Ed25519 License Protected)
│       ├── src/
│       │   ├── crypto.ts            # Asymmetric Signature Verification & Date Engine
│       │   ├── audit_logger.ts      # Compliance Audit Log Exporter
│       │   ├── sso.ts               # SAML / SSO Authentication Provider
│       │   ├── rbac.ts              # Role-Based Access Control Matrix
│       │   ├── telemetry.ts         # Seat & Node Quota Enforcer
│       │   └── index.ts             # Feature Gate Controller
├── apps/
│   └── demo/                        # End-to-End Execution Test Suite
├── scripts/
│   ├── generate-keypair.ts          # Generates Maintainer Ed25519 Public & Private Keys
│   └── generate-license.ts          # Maintains CLI to sign customer licenses
└── COMMERCIAL_LICENSE_AGREEMENT.md  # Official Enterprise Commercial Contract ($499–$2,499+/yr)
```

---

## 🚀 Quickstart & Verification Commands

### 1. Generate Ed25519 Asymmetric Keypair
Run this once as the project maintainer to generate your Private and Public keys:
```bash
npx tsx scripts/generate-keypair.ts
```
* **Public Key** (`keys/public.pem`): Embedded in `@open-core/enterprise`. Used by customer apps to verify signatures offline.
* **Private Key** (`keys/private.pem`): **KEEP SECRET!** Used only by you (or your Stripe/LemonSqueezy server) to issue signed licenses.

### 2. Issue a Commercial License Key to a Customer
To issue a signed commercial license for a customer:
```bash
npx tsx scripts/generate-license.ts "Acme Corp" "cto@acme.com" "enterprise" 100 20 365
```
* Arguments: `<CompanyName>` `<CustomerEmail>` `<Tier: pro|enterprise|ultimate>` `<MaxSeats>` `<MaxNodes>` `<ValidDays>`

### 3. Run the Production Verification Suite
```bash
npx tsx apps/demo/src/index.ts
```

---

## 💡 How It Protects Your Software

1. **Copyleft Protection (AGPL-3.0)**: Forces open-source users and cloud providers to share their source code if they use your core library over a network.
2. **Cryptographic Tamper-Proofing (Ed25519)**: Because license validation uses asymmetric public-key cryptography, customers cannot alter seat counts, expiration dates, or forge licenses without your private key.
3. **Grace Period & Telemetry**: If a license expires, customers receive a 14-day grace period with renewal notices before enterprise features lock.
