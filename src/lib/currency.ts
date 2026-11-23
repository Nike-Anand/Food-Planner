import type { Currency } from '@/types/shared'

export const USD_TO_INR_RATE = 85

const currencyFormatters: Record<Currency, Intl.NumberFormat> = {
  INR: new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }),
}

export function convertUsdToInr(amount: number): number {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new RangeError('USD estimate must be a finite, non-negative amount.')
  }

  return Math.round((amount * USD_TO_INR_RATE + Number.EPSILON) * 100) / 100
}

export function formatCurrency(amount: number, currency: Currency): string {
  if (!Number.isFinite(amount)) {
    throw new RangeError('Currency amount must be finite.')
  }

  return currencyFormatters[currency].format(amount)
}
