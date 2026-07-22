import { AsymmetricLicenseManager, CommercialLicensePayload } from './crypto';

/**
 * Automated License Generation Microservice
 * 
 * Integrates directly with Stripe Checkout or Lemon Squeezy Webhooks
 * to issue and return signed Ed25519 commercial license keys automatically!
 */

export interface WebhookOrderPayload {
  orderId: string;
  customerName: string;
  customerEmail: string;
  productTier: 'pro' | 'enterprise' | 'ultimate';
  seatsCount: number;
  nodesCount: number;
  durationMonths: number;
}

export class AutomatedLicenseServer {
  private privateKeyPem: string;

  constructor(privateKeyPem: string) {
    this.privateKeyPem = privateKeyPem;
  }

  public handlePaymentWebhook(order: WebhookOrderPayload): { licenseKey: string; payload: CommercialLicensePayload } {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + order.durationMonths * 30 * 24 * 60 * 60 * 1000);

    const licensePayload: CommercialLicensePayload = {
      licenseId: `lic_${order.orderId}_${Math.random().toString(36).substring(2, 6)}`,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      tier: order.productTier,
      maxSeats: order.seatsCount,
      maxNodes: order.nodesCount,
      issuedAt: now.toISOString().split('T')[0],
      expiresAt: expiresAt.toISOString().split('T')[0],
      gracePeriodDays: 14,
    };

    const licenseKey = AsymmetricLicenseManager.signLicense(licensePayload, this.privateKeyPem);

    console.log(`[AUTOMATED LICENSE SERVER] Successfully issued license ${licensePayload.licenseId} for ${order.customerName} (${order.customerEmail})`);

    return {
      licenseKey,
      payload: licensePayload,
    };
  }
}
