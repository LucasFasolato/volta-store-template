import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { buildBillingAccess, getBillingAccessOverride } from '@/lib/billing/access'
import { isMercadoPagoConfigured, isMercadoPagoWebhookConfigured } from '@/lib/billing/mercado-pago'
import type { BillingOverview, BillingPayment, BillingSubscription } from '@/lib/billing/types'

function mapSubscription(row: any): BillingSubscription {
  return {
    id: row.id,
    storeId: row.store_id,
    providerSubscriptionId: row.provider_subscription_id,
    providerStatus: row.provider_status,
    status: row.status,
    payerEmail: row.payer_email,
    currency: row.currency,
    introPrice: Number(row.intro_price),
    standardPrice: Number(row.standard_price),
    introCyclesTotal: Number(row.intro_cycles_total),
    introCyclesPaid: Number(row.intro_cycles_paid),
    currentAmount: Number(row.current_amount),
    nextPaymentDate: row.next_payment_date,
    checkoutUrl: row.checkout_url,
    priceUpgradedAt: row.price_upgraded_at,
    canceledAt: row.canceled_at,
    lastError: row.last_error,
    lastSyncedAt: row.last_synced_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapPayment(row: any): BillingPayment {
  return {
    id: row.id,
    providerInvoiceId: row.provider_invoice_id,
    providerPaymentId: row.provider_payment_id,
    paymentStatus: row.payment_status,
    paymentStatusDetail: row.payment_status_detail,
    amount: Number(row.amount),
    currency: row.currency,
    debitDate: row.debit_date,
    paidAt: row.paid_at,
    createdAt: row.created_at,
  }
}

export async function getBillingOverview(storeId: string): Promise<BillingOverview> {
  const supabase = await createClient()
  const db = supabase as any
  const [subscriptionResult, paymentsResult, accessOverride] = await Promise.all([
    db.from('billing_subscriptions').select('*').eq('store_id', storeId).maybeSingle(),
    db
      .from('billing_payments')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })
      .limit(8),
    getBillingAccessOverride(storeId),
  ])

  if (subscriptionResult.error) {
    throw new Error(`No pudimos leer tu suscripción: ${subscriptionResult.error.message}`)
  }
  if (paymentsResult.error) {
    throw new Error(`No pudimos leer tus cobros: ${paymentsResult.error.message}`)
  }

  const subscription = subscriptionResult.data ? mapSubscription(subscriptionResult.data) : null

  return {
    subscription,
    payments: (paymentsResult.data || []).map(mapPayment),
    access: buildBillingAccess(accessOverride, subscription),
    providerConfigured: isMercadoPagoConfigured(),
    webhookConfigured: isMercadoPagoWebhookConfigured(),
  }
}
