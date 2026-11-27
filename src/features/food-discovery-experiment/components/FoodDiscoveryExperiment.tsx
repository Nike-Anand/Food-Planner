'use client'

import { useEffect, useState } from 'react'
import { FoodCatalogView } from '@/features/food-ordering/components/FoodCatalogView'
import { RecipeMakerView } from '@/features/recipe-maker/components/RecipeMakerView'
import {
  loadFoodDiscoveryAssignment,
  recordFoodDiscoveryConversion,
  type FoodDiscoveryAction,
  type FoodDiscoveryAssignment,
} from '../flagsmithClient'

type ExperimentScreen =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; assignment: FoodDiscoveryAssignment }

type ConversionStatus = 'idle' | 'sending' | 'recorded' | 'already-recorded' | 'error'

export function FoodDiscoveryExperiment() {
  const [screen, setScreen] = useState<ExperimentScreen>({ status: 'loading' })
  const [conversionStatus, setConversionStatus] =
    useState<ConversionStatus>('idle')

  useEffect(() => {
    let isMounted = true

    void loadFoodDiscoveryAssignment()
      .then((assignment) => {
        if (isMounted) {
          setScreen({ status: 'ready', assignment })
        }
      })
      .catch((error: unknown) => {
        console.error('Could not load the Flagsmith food discovery experiment.', error)
        if (isMounted) {
          setScreen({ status: 'error' })
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const recordAction = (action: FoodDiscoveryAction) => {
    if (screen.status !== 'ready') {
      return
    }

    setConversionStatus('sending')
    void recordFoodDiscoveryConversion(screen.assignment, action)
      .then((recorded) => {
        setConversionStatus(recorded ? 'recorded' : 'already-recorded')
      })
      .catch((error: unknown) => {
        console.error('Could not record the Flagsmith experiment conversion.', error)
        setConversionStatus('error')
      })
  }

  if (screen.status === 'loading') {
    return (
      <section
        aria-live="polite"
        className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center"
      >
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />
        <p className="text-sm font-semibold text-slate-700">
          Preparing your food discovery experience…
        </p>
      </section>
    )
  }

  if (screen.status === 'error') {
    return (
      <section
        role="alert"
        className="flex min-h-[50vh] flex-col items-center justify-center gap-3 rounded-2xl bg-white px-6 py-10 text-center shadow-sm"
      >
        <h1 className="text-lg font-bold text-slate-900">
          The experiment is unavailable
        </h1>
        <p className="max-w-sm text-sm text-slate-600">
          Check the public Flagsmith environment ID and confirm that
          food_discovery_experiment is running with the expected variants. The
          recipe variant also requires cook_yourself_enabled to be on.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-2 min-h-12 rounded-xl bg-orange-600 px-5 text-sm font-bold text-white hover:bg-orange-700"
        >
          Retry
        </button>
      </section>
    )
  }

  const isFoodOrdering = screen.assignment.variant === 'food_ordering'

  return (
    <div className="space-y-4">
      <header className="rounded-2xl bg-white p-4 shadow-sm">
        <h1 className="text-lg font-extrabold text-slate-900">
          {isFoodOrdering ? 'Browse sample dishes' : 'Cook with your pantry'}
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          {isFoodOrdering
            ? 'Explore the menu and add a dish to your cart.'
            : 'Select ingredients you have and generate a sample recipe.'}
        </p>
      </header>

      {conversionStatus !== 'idle' && (
        <p
          aria-live="polite"
          role={conversionStatus === 'error' ? 'alert' : 'status'}
          className={`rounded-xl px-3 py-2 text-xs font-medium ${
            conversionStatus === 'error'
              ? 'border border-red-200 bg-red-50 text-red-700'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          {conversionStatus === 'sending' &&
            'Recording your primary action in Flagsmith…'}
          {conversionStatus === 'recorded' &&
            'Your primary action was sent to the experiment metric.'}
          {conversionStatus === 'already-recorded' &&
            'This anonymous visitor has already counted a conversion.'}
          {conversionStatus === 'error' &&
            'Your action completed, but the experiment event could not be recorded.'}
        </p>
      )}

      {isFoodOrdering ? (
        <FoodCatalogView
          onDishAdded={() => recordAction('dish_added_to_cart')}
        />
      ) : (
        <RecipeMakerView
          onRecipeGenerated={() => recordAction('recipe_generated')}
        />
      )}
    </div>
  )
}
