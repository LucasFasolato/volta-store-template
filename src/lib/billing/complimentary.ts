export type ComplimentarySubscriptionState = {
  status: string
  providerSubscriptionId: string | null
}

type ProviderSubscription = {
  id: string
  status?: string | null
}

type CancellationDependencies = {
  getSubscription: (subscriptionId: string) => Promise<ProviderSubscription>
  cancelSubscription: (subscriptionId: string) => Promise<ProviderSubscription>
  persistSubscription: (storeId: string, subscription: ProviderSubscription) => Promise<unknown>
}

const CANCELABLE_PROVIDER_STATUSES = new Set(['authorized', 'pending', 'paused'])

export async function ensureMercadoPagoCancellation(
  storeId: string,
  subscription: ComplimentarySubscriptionState | null,
  dependencies: CancellationDependencies,
): Promise<void> {
  if (!subscription) return
  if (subscription.status === 'canceled') return
  if (subscription.status === 'not_started' && !subscription.providerSubscriptionId) return

  const subscriptionId = subscription.providerSubscriptionId
  if (!subscriptionId) {
    throw new Error('The local subscription may be chargeable but has no provider identifier.')
  }

  const current = await dependencies.getSubscription(subscriptionId)
  if (current.id !== subscriptionId) {
    throw new Error('Mercado Pago returned a different subscription identifier.')
  }

  if (current.status === 'canceled') {
    await dependencies.persistSubscription(storeId, current)
    return
  }

  if (!current.status || !CANCELABLE_PROVIDER_STATUSES.has(current.status)) {
    throw new Error(`Mercado Pago returned an unexpected subscription status: ${current.status || 'missing'}.`)
  }

  await dependencies.cancelSubscription(subscriptionId)

  const confirmed = await dependencies.getSubscription(subscriptionId)
  if (confirmed.id !== subscriptionId || confirmed.status !== 'canceled') {
    throw new Error('Mercado Pago did not confirm the canceled subscription state.')
  }

  await dependencies.persistSubscription(storeId, confirmed)
}
