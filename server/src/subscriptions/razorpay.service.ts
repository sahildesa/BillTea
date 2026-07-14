import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class RazorpayService {
  private razorpay: any;
  private keyId: string;
  private keySecret: string;

  constructor(private config: ConfigService) {
    this.keyId = this.config.get<string>('RAZORPAY_KEY_ID', '');
    this.keySecret = this.config.get<string>('RAZORPAY_KEY_SECRET', '');

    // Dynamic import to handle razorpay module
    const Razorpay = require('razorpay');
    this.razorpay = new Razorpay({
      key_id: this.keyId,
      key_secret: this.keySecret,
    });
  }

  /**
   * Get the public Razorpay key ID (sent to frontend for checkout).
   */
  getKeyId(): string {
    return this.keyId;
  }

  async createOrder(amount: number, currency: string, receipt: string, notes?: Record<string, string>) {
    if (!this.keyId || !this.keySecret) {
      throw new InternalServerErrorException('Razorpay keys are not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env file and restart the server.');
    }

    try {
      const order = await this.razorpay.orders.create({
        amount: Math.round(amount * 100), // Razorpay expects amount in paise
        currency,
        receipt,
        notes: notes || {},
      });

      return order;
    } catch (error: any) {
      console.error('Razorpay order creation failed:', error);
      if (error.statusCode === 401) {
        throw new InternalServerErrorException('Razorpay API Key is invalid, expired, or revoked. Please generate new test keys in your Razorpay Dashboard and update your .env file.');
      }
      throw new InternalServerErrorException(error.message || 'Failed to create payment order. Please try again.');
    }
  }

  /**
   * Verify Razorpay payment signature.
   * This is the ONLY way to confirm a payment is genuine.
   */
  verifySignature(orderId: string, paymentId: string, signature: string): boolean {
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(body)
      .digest('hex');

    return expectedSignature === signature;
  }

  /**
   * Fetch payment details from Razorpay.
   */
  async fetchPayment(paymentId: string) {
    try {
      return await this.razorpay.payments.fetch(paymentId);
    } catch (error: any) {
      console.error('Razorpay payment fetch failed:', error);
      throw new InternalServerErrorException('Failed to fetch payment details.');
    }
  }
}
