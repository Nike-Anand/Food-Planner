import { redirect } from 'next/navigation'
import { CheckoutView } from '@/components/checkout/CheckoutView'
import type { CartItemSource } from '@/types/shared'

interface CheckoutPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CheckoutPage({
  searchParams,
}: CheckoutPageProps) {
  const { source } = await searchParams
  if (source !== 'food_menu' && source !== 'recipe_ingredient') {
    redirect('/cart')
  }

  const checkoutSource: CartItemSource = source
  return <CheckoutView source={checkoutSource} />
}
