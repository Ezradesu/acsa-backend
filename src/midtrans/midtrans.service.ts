import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const midtransClient = require('midtrans-client');

@Injectable()
export class MidtransService {
  private snap: any;

  constructor(private configService: ConfigService) {
    const isProd = this.configService.get('MIDTRANS_IS_PRODUCTION');
    this.snap = new midtransClient.Snap({
      isProduction: isProd === true || isProd === 'true',
      serverKey: this.configService.get<string>('MIDTRANS_SERVER_KEY'),
      clientKey: this.configService.get<string>('MIDTRANS_CLIENT_KEY'),
    });
  }

  async createSnapTransaction(order: any, user: any) {
    const parameter = {
      transaction_details: {
        order_id: order.id,
        gross_amount: Math.round(Number(order.total)),
      },
      customer_details: {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      },
      item_details: order.items.map((item) => ({
        id: item.id_product,
        price: Math.round(Number(item.price)),
        quantity: item.quantity,
        name: item.product.name,
      })),
    };

    return this.snap.createTransaction(parameter);
  }

  // Verification helper for Midtrans Webhook
  verifySignatureKey(notification: any): boolean {
    const crypto = require('crypto');
    const { order_id, status_code, gross_amount, signature_key } = notification;
    const serverKey = this.configService.get<string>('MIDTRANS_SERVER_KEY');
    
    const payload = `${order_id}${status_code}${gross_amount}${serverKey}`;
    const hash = crypto.createHash('sha512').update(payload).digest('hex');
    
    return hash === signature_key;
  }
}
