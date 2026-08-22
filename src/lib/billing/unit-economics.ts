export type BillingEconomicsInput = {
  amount: number
  netReceivedAmount?: number | null
  processorDeductionsAmount?: number | null
}

export function resolveProcessorEconomics(input: BillingEconomicsInput) {
  const gross = Math.max(0, Number(input.amount) || 0)
  const explicitNet = Number(input.netReceivedAmount)
  const explicitFees = Number(input.processorDeductionsAmount)
  const hasNet = input.netReceivedAmount != null && Number.isFinite(explicitNet) && explicitNet >= 0
  const hasFees = input.processorDeductionsAmount != null && Number.isFinite(explicitFees) && explicitFees >= 0
  const net = hasNet ? Math.min(gross, explicitNet) : null
  const fees = hasFees
    ? Math.min(gross, explicitFees)
    : net == null
      ? null
      : Math.max(0, gross - net)

  return { gross, net, fees }
}

export function summarizeUnitEconomics(payments: BillingEconomicsInput[]) {
  let grossRevenue = 0
  let knownNetRevenue = 0
  let processorFees = 0
  let knownNetPayments = 0

  for (const payment of payments) {
    const economics = resolveProcessorEconomics(payment)
    grossRevenue += economics.gross
    if (economics.net != null) {
      knownNetRevenue += economics.net
      knownNetPayments += 1
    }
    if (economics.fees != null) processorFees += economics.fees
  }

  return {
    approvedPayments: payments.length,
    grossRevenue,
    knownNetRevenue,
    processorFees,
    knownNetPayments,
    effectiveFeeRate: grossRevenue > 0 && knownNetPayments === payments.length
      ? processorFees / grossRevenue
      : null,
  }
}
