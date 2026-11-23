'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Dish, Ingredient, CartItem } from '@/lib/types'
import { useCartStore } from '@/store/cartStore'
import IngredientList from '@/components/IngredientList'
import CostEstimate from '@/components/CostEstimate'
import CartDrawer from '@/components/CartDrawer'
import CookingMode from '@/components/CookingMode'
import ToastContainer, { ToastItem } from '@/components/Toast'
import { ArrowLeft, ShoppingBag, Clock, Users, ChefHat, Zap, Heart } from 'lucide-react'
import Image from 'next/image'

const FALLBACK = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'

function getSteps(name: string): string[] {
  return [
    `Gather and measure all ingredients for ${name}. Having everything prepped before you start makes cooking smoother.`,
    'Wash and chop all vegetables. Mince garlic and ginger finely. Keep proteins ready at room temperature.',
    'Heat oil or butter in a heavy-bottomed pan over medium heat until it shimmers.',
    'Add whole spices (if any) and let them splutter for 30 seconds. Then add onions and sauté until golden brown, about 5–7 minutes.',
    'Add ginger-garlic paste and cook for 2 minutes until the raw smell disappears.',
    'Add tomatoes or tomato puree and cook until the oil separates from the masala, about 8–10 minutes.',
    'Add ground spices — turmeric, coriander, cumin, chili powder. Stir well and cook for 1–2 minutes.',
    'Add the main protein or vegetables. Mix well to coat with the masala.',
    'Add water or stock as needed. Cover and cook on low heat until done.',
    'Finish with cream, butter, or fresh herbs. Adjust salt and seasoning to taste.',
    `Plate your ${name} and garnish. Serve hot with rice, bread, or your preferred accompaniment. Enjoy! 🎉`,
  ]
}

function getDiff(t: number) {
  if (t <= 20) return 'Easy'
  if (t <= 45) return 'Medium'
  return 'Hard'
}

export default function DishPage() {
  const { id }    = useParams<{ id: string }>()
  const router    = useRouter()
  const [dish, setDish]               = useState<Dish | null>(null)
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [cart, setCart]               = useState<CartItem[]>([])
  const [showCart, setShowCart]       = useState(false)
  const [showCook, setShowCook]       = useState(false)
  const [ordering, setOrdering]       = useState(false)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(false)
  const [toasts, setToasts]           = useState<ToastItem[]>([])
  const [tab, setTab]                 = useState<'ingredients' | 'steps'>('ingredients')
  const [fav, setFav]                 = useState(false)
  const addIngredientsToCart          = useCartStore((state) => state.addIngredientsToCart)

  const toast = useCallback((message: string, type: ToastItem['type'] = 'success') => {
    setToasts(p => [...p, { id: Math.random().toString(36).slice(2), message, type }])
  }, [])

  useEffect(() => {
    fetch(`/api/dishes/${id}`)
      .then(r => r.json())
      .then(({ dish, ingredients }) => {
        if (!dish) { setError(true); return }
        setDish(dish); setIngredients(ingredients || []); setLoading(false)
      })
      .catch(() => { setError(true); setLoading(false) })
  }, [id])

  const addToCart = useCallback((ing: Ingredient) => {
    setCart(prev => {
      const ex = prev.find(c => c.ingredient.id === ing.id)
      if (ex) return prev.map(c => c.ingredient.id === ing.id ? { ...c, quantity: c.quantity + 1 } : c)
      toast(`${ing.name} added`)
      return [...prev, { ingredient: ing, quantity: 1 }]
    })
  }, [toast])

  const removeFromCart = useCallback((ingId: string) => {
    setCart(prev => {
      const ex = prev.find(c => c.ingredient.id === ingId)
      if (!ex) return prev
      if (ex.quantity === 1) return prev.filter(c => c.ingredient.id !== ingId)
      return prev.map(c => c.ingredient.id === ingId ? { ...c, quantity: c.quantity - 1 } : c)
    })
  }, [])

  const deleteFromCart = useCallback((ingId: string) => {
    setCart(prev => prev.filter(c => c.ingredient.id !== ingId))
    toast('Removed from basket', 'info')
  }, [toast])

  const addAll = () => {
    ingredients.forEach(ing => setCart(prev => prev.find(c => c.ingredient.id === ing.id) ? prev : [...prev, { ingredient: ing, quantity: 1 }]))
    // Also sync to global central cart store
    addIngredientsToCart(
      ingredients.map(ing => ({
        id: ing.id,
        name: ing.name,
        quantity: `${ing.quantity || ''} ${ing.unit || ''}`.trim() || '1 portion',
        category: 'pantry',
        estimatedPrice: Number(ing.price_estimate) || 25,
        currency: 'INR',
      })),
      dish?.name
    )
    toast(`All ${ingredients.length} ingredients added to basket & main cart 🛒`)
    setShowCart(true)
  }

  const placeOrder = async () => {
    setOrdering(true)
    try {
      const total = cart.reduce((s, c) => s + Number(c.ingredient.price_estimate) * c.quantity, 0)
      await fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_session: 'guest', items: cart, total }) })
      toast('Order simulated! Ingredients on their way 🚀')
      setCart([]); setShowCart(false)
    } catch { toast('Failed to place order', 'error') }
    finally { setOrdering(false) }
  }

  const cartCount = cart.reduce((s, c) => s + c.quantity, 0)
  const steps     = dish ? getSteps(dish.name) : []
  const diff      = dish ? getDiff(dish.cook_time) : 'Easy'

  if (loading) return (
    <div style={{ minHeight: '100svh', background: '#F8F5EF' }}>
      <div style={{ height: 280, background: '#EDE9E0', animation: 'pulse 1.5s infinite' }} />
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {[200, 160, 120].map((w, i) => <div key={i} style={{ height: 16, width: `${w}px`, background: '#EDE9E0', animation: 'pulse 1.5s infinite' }} />)}
      </div>
    </div>
  )

  if (error || !dish) return (
    <div style={{ minHeight: '100svh', background: '#F8F5EF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <p className="font-serif" style={{ fontSize: '1.5rem', color: '#1C1C1C', marginBottom: '0.5rem' }}>Recipe not found</p>
      <p style={{ fontSize: '0.85rem', color: '#7A7A7A', marginBottom: '1.5rem' }}>This recipe doesn&apos;t exist or was removed.</p>
      <button onClick={() => router.back()} style={{ background: '#1C1C1C', color: '#F8F5EF', padding: '0.75rem 2rem', border: 'none', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        Go Back
      </button>
    </div>
  )

  return (
    <main style={{ minHeight: '100svh', background: '#F8F5EF', paddingBottom: '6rem' }}>
      <ToastContainer toasts={toasts} onRemove={id => setToasts(p => p.filter(t => t.id !== id))} />

      {/* Hero image */}
      <div style={{ position: 'relative', height: '65vw', maxHeight: 280, width: '100%' }}>
        <Image src={dish.image_url || FALLBACK} alt={dish.name} fill className="object-cover" unoptimized priority />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(28,28,28,0.85) 0%, rgba(28,28,28,0.1) 50%, transparent 100%)' }} />

        {/* Nav */}
        <button onClick={() => router.back()} style={{ position: 'absolute', top: '3rem', left: '1.25rem', width: 36, height: 36, background: 'rgba(28,28,28,0.5)', backdropFilter: 'blur(8px)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ArrowLeft size={18} color="#F8F5EF" />
        </button>
        <button onClick={() => setFav(f => !f)} style={{ position: 'absolute', top: '3rem', right: cartCount > 0 ? '4.5rem' : '1.25rem', width: 36, height: 36, background: 'rgba(28,28,28,0.5)', backdropFilter: 'blur(8px)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Heart size={18} color={fav ? '#B85C38' : '#F8F5EF'} fill={fav ? '#B85C38' : 'none'} />
        </button>
        {cartCount > 0 && (
          <button onClick={() => setShowCart(true)} style={{ position: 'absolute', top: '3rem', right: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.875rem', background: '#B85C38', border: 'none', cursor: 'pointer' }}>
            <ShoppingBag size={14} color="#F8F5EF" />
            <span style={{ color: '#F8F5EF', fontWeight: 700, fontSize: '0.8rem' }}>{cartCount}</span>
          </button>
        )}

        {/* Dish info */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.25rem' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#B85C38', marginBottom: '0.35rem' }}>{dish.cuisine}</p>
          <h1 className="font-serif" style={{ color: '#F8F5EF', fontSize: '1.75rem', lineHeight: 1.15, fontWeight: 400 }}>{dish.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem', color: 'rgba(248,245,239,0.65)', fontSize: '0.72rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={11} />{dish.cook_time} min</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Users size={11} />{dish.servings} servings</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><ChefHat size={11} />{diff}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      {dish.description && (
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #E2DDD5', background: '#FFFFFF' }}>
          <p style={{ fontSize: '0.9rem', color: '#3D3D3D', lineHeight: 1.7 }}>{dish.description}</p>
        </div>
      )}

      {/* Start Cooking CTA */}
      <div style={{ padding: '1rem 1.25rem', background: '#FFFFFF', borderBottom: '1px solid #E2DDD5' }}>
        <button
          onClick={() => setShowCook(true)}
          style={{ width: '100%', padding: '0.875rem', background: '#1C1C1C', border: 'none', color: '#F8F5EF', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', letterSpacing: '0.04em', fontFamily: "'DM Sans', system-ui, sans-serif" }}
        >
          <Zap size={15} color="#B85C38" /> Start Cooking Mode
        </button>
      </div>

      {/* Cost estimate */}
      {ingredients.length > 0 && (
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #E2DDD5' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3D3D3D', marginBottom: '0.75rem' }}>Cost Breakdown</p>
          <CostEstimate ingredients={ingredients} servings={dish.servings} />
        </div>
      )}

      {/* Tabs */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2DDD5', display: 'flex' }}>
        {(['ingredients', 'steps'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '0.875rem', background: 'none', border: 'none',
              borderBottom: tab === t ? '2px solid #1C1C1C' : '2px solid transparent',
              color: tab === t ? '#1C1C1C' : '#7A7A7A',
              fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
              letterSpacing: '0.06em', textTransform: 'uppercase',
              fontFamily: "'DM Sans', system-ui, sans-serif",
            }}
          >
            {t === 'ingredients' ? `Ingredients (${ingredients.length})` : `Instructions (${steps.length})`}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ background: '#FFFFFF' }}>
        {tab === 'ingredients' ? (
          ingredients.length > 0
            ? <IngredientList ingredients={ingredients} cart={cart} onAdd={addToCart} onRemove={removeFromCart} />
            : <p style={{ textAlign: 'center', padding: '3rem', color: '#7A7A7A', fontSize: '0.875rem' }}>No ingredient data available</p>
        ) : (
          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ width: 28, height: 28, background: '#F8F5EF', border: '1px solid #E2DDD5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.1rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#B85C38' }}>{i + 1}</span>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#3D3D3D', lineHeight: 1.7, flex: 1 }}>{step}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sticky bottom bar */}
      {ingredients.length > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '430px', background: '#F8F5EF', borderTop: '1px solid #E2DDD5', padding: '0.875rem 1.25rem', paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))', display: 'flex', gap: '0.75rem', zIndex: 30 }}>
          {cartCount > 0 && (
            <button
              onClick={() => setShowCart(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 1rem', background: '#FFFFFF', border: '1px solid #E2DDD5', cursor: 'pointer' }}
            >
              <ShoppingBag size={16} color="#1C1C1C" />
              <span style={{ background: '#B85C38', color: '#F8F5EF', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>{cartCount}</span>
            </button>
          )}
          <button
            onClick={addAll}
            style={{ flex: 1, padding: '0.875rem', background: '#1C1C1C', border: 'none', color: '#F8F5EF', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', letterSpacing: '0.04em', fontFamily: "'DM Sans', system-ui, sans-serif" }}
          >
            <ShoppingBag size={15} /> Add All to Basket
          </button>
        </div>
      )}

      {showCart && <CartDrawer cart={cart} onClose={() => setShowCart(false)} onOrder={placeOrder} onAdd={addToCart} onRemove={removeFromCart} onDelete={deleteFromCart} ordering={ordering} />}
      {showCook && <CookingMode dishName={dish.name} steps={steps} ingredients={ingredients} onClose={() => setShowCook(false)} />}
    </main>
  )
}
