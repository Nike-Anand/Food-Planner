'use client'
import { CartItem, Ingredient } from '@/lib/types'
import { X, Plus, Minus, Trash2 } from 'lucide-react'

type Props = {
  cart: CartItem[]
  onClose: () => void
  onOrder: () => void
  onAdd: (ing: Ingredient) => void
  onRemove: (id: string) => void
  onDelete: (id: string) => void
  ordering: boolean
}

export default function CartDrawer({ cart, onClose, onOrder, onAdd, onRemove, onDelete, ordering }: Props) {
  const subtotal    = cart.reduce((s, c) => s + Number(c.ingredient.price_estimate) * c.quantity, 0)
  const delivery    = 25
  const grandTotal  = subtotal + delivery

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(28,28,28,0.6)', backdropFilter: 'blur(4px)' }}
      />

      {/* Sheet */}
      <div style={{
        position: 'relative', background: '#F8F5EF', maxHeight: '88svh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 -4px 40px rgba(28,28,28,0.18)',
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '0.75rem 0 0.25rem' }}>
          <div style={{ width: 36, height: 4, background: '#E2DDD5', borderRadius: 2 }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.25rem 0.75rem', borderBottom: '1px solid #E2DDD5' }}>
          <div>
            <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3D3D3D' }}>Your Basket</p>
            <p className="font-serif" style={{ fontSize: '1.3rem', color: '#1C1C1C', lineHeight: 1.1, marginTop: '0.15rem' }}>
              {cart.length} {cart.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, background: '#EDE9E0', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={16} color="#1C1C1C" />
          </button>
        </div>

        {/* Demo notice */}
        <div style={{ margin: '0.75rem 1.25rem 0', padding: '0.6rem 0.875rem', background: '#F2E8E3', borderLeft: '3px solid #B85C38' }}>
          <p style={{ fontSize: '0.7rem', color: '#B85C38', lineHeight: 1.5 }}>
            <strong>Demo:</strong> No real order will be placed. This simulates an Instamart-style checkout.
          </p>
        </div>

        {/* Items */}
        <div style={{ overflowY: 'auto', flex: 1, marginTop: '0.75rem' }} className="no-scrollbar">
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1.25rem' }}>
              <p className="font-serif" style={{ fontSize: '1.25rem', color: '#1C1C1C', marginBottom: '0.5rem' }}>Your basket is empty</p>
              <p style={{ fontSize: '0.8rem', color: '#7A7A7A' }}>Add ingredients from a recipe to get started</p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div
                key={item.ingredient.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem 1.25rem',
                  borderBottom: idx < cart.length - 1 ? '1px solid #E2DDD5' : 'none',
                  background: '#FFFFFF',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1C1C1C' }}>{item.ingredient.name}</p>
                  <p style={{ fontSize: '0.7rem', color: '#7A7A7A' }}>{item.ingredient.quantity} {item.ingredient.unit}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                  <button onClick={() => onRemove(item.ingredient.id)} style={{ width: 26, height: 26, border: '1px solid #E2DDD5', background: '#F8F5EF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Minus size={11} color="#1C1C1C" />
                  </button>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1C1C1C', minWidth: '1.25rem', textAlign: 'center' }}>{item.quantity}</span>
                  <button onClick={() => onAdd(item.ingredient)} style={{ width: 26, height: 26, background: '#1C1C1C', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Plus size={11} color="#F8F5EF" />
                  </button>
                </div>
                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1C1C1C', minWidth: '2.5rem', textAlign: 'right', flexShrink: 0 }}>
                  ₹{Math.round(Number(item.ingredient.price_estimate) * item.quantity)}
                </p>
                <button onClick={() => onDelete(item.ingredient.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', flexShrink: 0 }}>
                  <Trash2 size={13} color="#E2DDD5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Summary + CTA */}
        {cart.length > 0 && (
          <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #E2DDD5', background: '#F8F5EF', paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
              {[
                { label: 'Subtotal', value: `₹${Math.round(subtotal)}` },
                { label: 'Delivery fee', value: `₹${delivery}` },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', color: '#7A7A7A' }}>{row.label}</span>
                  <span style={{ fontSize: '0.8rem', color: '#7A7A7A' }}>{row.value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #E2DDD5' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1C1C1C' }}>Total</span>
                <span className="font-serif" style={{ fontSize: '1.1rem', color: '#1C1C1C' }}>₹{Math.round(grandTotal)}</span>
              </div>
            </div>
            <button
              onClick={onOrder}
              disabled={ordering}
              style={{
                width: '100%', padding: '1rem', background: ordering ? '#7A7A7A' : '#1C1C1C',
                color: '#F8F5EF', border: 'none', fontSize: '0.875rem', fontWeight: 700,
                cursor: ordering ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                letterSpacing: '0.04em', fontFamily: "'DM Sans', system-ui, sans-serif",
              }}
            >
              {ordering ? (
                <><div style={{ width: 16, height: 16, border: '2px solid rgba(248,245,239,0.3)', borderTopColor: '#F8F5EF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Placing Order…</>
              ) : (
                `Checkout via Instamart · ₹${Math.round(grandTotal)}`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
