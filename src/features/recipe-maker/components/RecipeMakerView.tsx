'use client';

import React, { useState } from 'react';
import { PANTRY_OPTIONS, SAMPLE_RECIPE } from '../data/mockIngredients';
import { useRecipeStore } from '@/store/recipeStore';
import { useCartStore } from '@/store/cartStore';
import { Sparkles, Check, ShoppingBag, Clock, ChefHat, Flame, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function RecipeMakerView() {
  const router = useRouter();
  const { selectedPantryIngredients, togglePantryIngredient } = useRecipeStore();
  const addIngredientsToCart = useCartStore((state) => state.addIngredientsToCart);
  const cartHasHydrated = useCartStore((state) => state.hasHydrated);

  const [hasGenerated, setHasGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [orderedMissing, setOrderedMissing] = useState(false);

  // Missing ingredients for the recipe that user doesn't have in pantry
  const missingIngredients = SAMPLE_RECIPE.ingredients.filter(
    (ing) => !selectedPantryIngredients.includes(ing.id)
  );

  const missingTotalCost = missingIngredients.reduce(
    (acc, curr) => acc + (curr.estimatedPrice || 0),
    0
  );

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setHasGenerated(true);
    }, 1000);
  };

  const handleOrderMissingIngredients = () => {
    addIngredientsToCart(missingIngredients, SAMPLE_RECIPE.title);
    setOrderedMissing(true);
    setTimeout(() => {
      router.push('/cart');
    }, 900);
  };

  return (
    <div className="space-y-5">
      {/* Step 1: Pantry Ingredient Selector */}
      <section className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              What is in your pantry?
            </h2>
            <p className="text-xs text-slate-500">Tap items you already have at home</p>
          </div>
          <span className="text-xs bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
            {selectedPantryIngredients.length} selected
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {PANTRY_OPTIONS.map((item) => {
            const isSelected = selectedPantryIngredients.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => togglePantryIngredient(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                {item.name}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || selectedPantryIngredients.length === 0}
          className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold text-sm shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Chef AI Crafting Recipe...
            </>
          ) : (
            <>
              <ChefHat className="w-4 h-4" />
              Generate Recipe with My Pantry
            </>
          )}
        </button>
      </section>

      {/* Step 2: Generated Recipe Card & Integration Bridge */}
      {hasGenerated && (
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="h-40 w-full relative overflow-hidden bg-slate-100">
            <img
              src={SAMPLE_RECIPE.imageUrl}
              alt={SAMPLE_RECIPE.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 text-white">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-600 px-2 py-0.5 rounded-full">
                AI Suggested Match (85%)
              </span>
              <h3 className="font-bold text-base mt-1 drop-shadow-sm">{SAMPLE_RECIPE.title}</h3>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div className="flex items-center justify-around py-2 bg-slate-50 rounded-xl text-xs text-slate-600">
              <span className="flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {SAMPLE_RECIPE.cookTimeMinutes} mins
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium">
                <ChefHat className="w-3.5 h-3.5 text-slate-400" />
                {SAMPLE_RECIPE.difficulty}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                {SAMPLE_RECIPE.calories} cal
              </span>
            </div>

            {/* Ingredients Check */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Ingredients Check
              </h4>
              <div className="space-y-1.5 text-xs">
                {SAMPLE_RECIPE.ingredients.map((ing) => {
                  const hasIt = selectedPantryIngredients.includes(ing.id);
                  return (
                    <div
                      key={ing.id}
                      className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0"
                    >
                      <span className="text-slate-700">
                        {ing.name} <span className="text-slate-400">({ing.quantity})</span>
                      </span>
                      {hasIt ? (
                        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" /> In Pantry
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                          +${ing.estimatedPrice?.toFixed(2)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* THE WINNING INTEGRATION BRIDGE CTA */}
            {missingIngredients.length > 0 && (
              <div className="p-3.5 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200/60 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-orange-950 flex items-center gap-1">
                      <ShoppingBag className="w-3.5 h-3.5 text-orange-600" />
                      Missing {missingIngredients.length} ingredients to cook this
                    </h5>
                    <p className="text-[11px] text-orange-800/80">
                      Instantly deliver missing pantry items to your doorstep!
                    </p>
                  </div>
                  <span className="text-xs font-extrabold text-orange-900">
                    ${missingTotalCost.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={handleOrderMissingIngredients}
                  disabled={!cartHasHydrated}
                  className="w-full py-2.5 px-3 bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:cursor-wait disabled:opacity-50"
                >
                  {orderedMissing ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Added to Food Cart! Opening...
                    </>
                  ) : (
                    <>
                      1-Click Order Missing Ingredients
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
