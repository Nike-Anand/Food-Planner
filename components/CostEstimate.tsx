'use client'
import { Ingredient } from '@/lib/types'

type Props = { ingredients: Ingredient[]; servings: number }

export default function CostEstimate({ ingredients, servings }: Props) {
  const totalCook    = ingredients.reduce((s, i) => s + Number(i.price_estimate), 0)
  const perServing   = totalCook / servings
  const restaurantEst = Math.round(totalCook * 2.4)
  const savings      = restaurantEst - totalCook
  const savingsPct   = Math.round((savings / restaurantEst) * 100)

  return (
    <div style={{ border: '1px solid #E2DDD5', background: '#FFFFFF' }}>
      {/* Header */}
      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #E2DDD5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3D3D3D' }}>
          Cost Comparison
        </p>
        <p style={{ fontSize: '0.6rem', color: '#7A7A7A', fontStyle: 'italic' }}>*Illustrative estimates</p>
      </div>

      {/* Rows */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #E2DDD5' }}>
        <div style={{ padding: '1rem', borderRight: '1px solid #E2DDD5' }}>
          <p style={{ fontSize: '0.65rem', color: '#7A7A7A', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cook at Home</p>
          <p className="font-serif" style={{ fontSize: '1.6rem', color: '#78836B', lineHeight: 1 }}>₹{Math.round(totalCook)}</p>
          <p style={{ fontSize: '0.65rem', color: '#7A7A7A', marginTop: '0.3rem' }}>₹{Math.round(perServing)}/serving · {servings} servings</p>
        </div>
        <div style={{ padding: '1rem' }}>
          <p style={{ fontSize: '0.65rem', color: '#7A7A7A', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Restaurant</p>
          <p className="font-serif" style={{ fontSize: '1.6rem', color: '#7A7A7A', lineHeight: 1, textDecoration: 'line-through' }}>₹{restaurantEst}</p>
          <p style={{ fontSize: '0.65rem', color: '#7A7A7A', marginTop: '0.3rem' }}>Estimated delivery price</p>
        </div>
      </div>

      {/* Savings */}
      <div style={{ padding: '0.75rem 1rem', background: '#F2E8E3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: '0.78rem', color: '#B85C38', fontWeight: 600 }}>You save by cooking yourself</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <p className="font-serif" style={{ fontSize: '1.1rem', color: '#B85C38' }}>₹{Math.round(savings)}</p>
          <span style={{ background: '#B85C38', color: '#FFFFFF', fontSize: '0.6rem', fontWeight: 700, padding: '0.15rem 0.5rem', letterSpacing: '0.04em' }}>
            {savingsPct}% OFF
          </span>
        </div>
      </div>
    </div>
  )
}
