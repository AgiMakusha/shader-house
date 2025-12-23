/**
 * Stripe Client Configuration
 * 
 * Server-side Stripe client for payment processing.
 * Uses Stripe Connect for marketplace payments.
 */

import Stripe from 'stripe';

// Validate required environment variable
if (!process.env.STRIPE_SECRET_KEY && process.env.NODE_ENV === 'production') {
  console.warn('Warning: STRIPE_SECRET_KEY is not set. Payments will run in demo mode.');
}

// Create Stripe client (will be null in demo mode)
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    })
  : null;

/**
 * Check if Stripe is configured and available
 */
export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

/**
 * Check if Stripe Connect is configured
 */
export function isStripeConnectConfigured(): boolean {
  return !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_CONNECT_CLIENT_ID);
}

/**
 * Get the base URL for redirects
 */
export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
}

