'use client'
import { Ingredient, CartItem } from '@/lib/types'
import { Plus, Minus } from 'lucide-react'

type Props = {
  ingredients: Ingredient[]
  cart: CartItem[]
  onAdd: (ing: Ingredient) => void
  onRemove: (id: string) => void
}

export default function IngredientList({ ingredients, cart, onAdd, onRemove }: Props) {
  const getQty = (id: string) => cart.find(c => c.ingredient.id === id)?.quantity ?? 0
  const addedCount = cart.length

  return (
    <div>
      {addedCount > 0 && (
        <div style={{ padding: '0.6rem 0.875rem', background: '#EEF0EB', borderBottom: '1px solid #E2DDD5', marginBottom: '0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#78836B', flexShrink: 0 }} />
          <p style={{ fontSize: '0.72rem', color: '#78836B', fontWeight: 600 }}>
            {addedCount} of {ingredients.length} ingredients in basket
          </p>
        </div>
      )}

      {ingredients.map((ing, idx) => {
        const qty    = getQty(ing.id)
        const inCart = qty > 0
        return (
          <div
            key={ing.id}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              borderBottom: idx < ingredients.length - 1 ? '1px solid #E2DDD5' : 'none',
              background: inCart ? '#EEF0EB' : '#FFFFFF',
              transition: 'background 0.15s',
            }}
          >
            {/* Left — name + qty */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1C1C1C', marginBottom: '0.15rem' }}>{ing.name}</p>
              <p style={{ fontSize: '0.7rem', color: '#7A7A7A' }}>
                {ing.quantity} {ing.unit}
                <span style={{ color: '#B85C38', fontWeight: 600, marginLeft: '0.4rem' }}>₹{ing.price_estimate}</span>
              </p>
            </div>

            {/* Right — stepper */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, marginLeft: '0.75rem' }}>
              {inCart ? (
                <>
                  <button
                    onClick={() => onRemove(ing.id)}
                    style={{ width: 28, height: 28, border: '1px solid #E2DDD5', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <Minus size={12} color="#1C1C1C" />
                  </button>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1C1C1C', minWidth: '1.25rem', textAlign: 'center' }}>{qty}</span>
                  <button
                    onClick={() => onAdd(ing)}
                    style={{ width: 28, height: 28, background: '#1C1C1C', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <Plus size={12} color="#F8F5EF" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => onAdd(ing)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                    padding: '0.4rem 0.875rem', background: '#1C1C1C', border: 'none',
                    color: '#F8F5EF', fontSize: '0.72rem', fontWeight: 600,
                    cursor: 'pointer', letterSpacing: '0.04em',
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                  }}
                >
                  <Plus size={11} /> Add
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
