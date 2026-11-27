import { CartView } from '@/features/food-ordering/components/CartView'

interface CartPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CartPage({ searchParams }: CartPageProps) {
  const { source } = await searchParams
  const sourceScope = Array.isArray(source) ? source[0] : source

  return (
    <CartView
      sourceScope={
        sourceScope === 'food_menu' || sourceScope === 'recipe_ingredient'
          ? sourceScope
          : undefined
      }
    />
  )
}
