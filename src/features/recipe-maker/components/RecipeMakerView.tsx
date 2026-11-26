'use client';

import React, { useState } from 'react';
import { PANTRY_OPTIONS, SAMPLE_RECIPE } from '../data/mockIngredients';
import { useRecipeStore } from '@/store/recipeStore';
import { useCartStore } from '@/store/cartStore';
import { Sparkles, Check, ShoppingBag, Clock, ChefHat, Flame, ArrowRight, ChevronLeft, ChevronRight, CheckCircle, Timer, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/currency';

export function RecipeMakerView() {
  const router = useRouter();
  const { selectedPantryIngredients, togglePantryIngredient } = useRecipeStore();
  const addIngredientsToCart = useCartStore((state) => state.addIngredientsToCart);
  const cartHasHydrated = useCartStore((state) => state.hasHydrated);

  const [hasGenerated, setHasGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [orderedMissing, setOrderedMissing] = useState(false);
  const [cookingMode, setCookingMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Missing ingredients for the recipe that user doesn't have in pantry
  const missingIngredients = SAMPLE_RECIPE.ingredients.filter(
    (ing) => !selectedPantryIngredients.includes(ing.id)
  );

  const missingTotalCost = missingIngredients.reduce(
    (acc, curr) => acc + curr.estimatedPrice,
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

  const handleQuickOrder = () => {
    const query = missingIngredients.map((i) => i.name).join(', ');
    window.open(`https://www.zeptonow.com/search?query=${encodeURIComponent(query)}`, '_blank');
  };

  const markStepDone = () => {
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    if (currentStep < SAMPLE_RECIPE.steps.length - 1) setCurrentStep((s) => s + 1);
  };

  const progress = Math.round((completedSteps.size / SAMPLE_RECIPE.steps.length) * 100);

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
                        {ing.name}
                        <span className="ml-1 text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-medium">{ing.quantity}</span>
                      </span>
                      {hasIt ? (
                        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" /> In Pantry
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                          +{formatCurrency(ing.estimatedPrice, ing.currency)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Commerce + Cart Integration Bridge */}
            {missingIngredients.length > 0 && (
              <div className="p-3.5 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200/60 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-orange-950 flex items-center gap-1">
                      <ShoppingBag className="w-3.5 h-3.5 text-orange-600" />
                      Missing {missingIngredients.length} ingredients
                    </h5>
                    <p className="text-[11px] text-orange-800/80">Get them delivered in minutes</p>
                  </div>
                  <span className="text-xs font-extrabold text-orange-900">
                    {formatCurrency(missingTotalCost, 'INR')}
                  </span>
                </div>

                <button
                  onClick={handleOrderMissingIngredients}
                  disabled={!cartHasHydrated}
                  className="w-full py-2.5 px-3 bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:cursor-wait disabled:opacity-50"
                >
                  {orderedMissing ? (
                    <><Check className="w-3.5 h-3.5" /> Added to Cart! Opening...</>
                  ) : (
                    <>Add to Recipe Cart <ArrowRight className="w-3.5 h-3.5" /></>
                  )}
                </button>

                <button
                  onClick={handleQuickOrder}
                  className="w-full py-2.5 px-3 bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" /> Quick Delivery · 10 mins
                </button>
              </div>
            )}

            {/* Start Cooking CTA */}
            <button
              onClick={() => { setCookingMode(true); setCurrentStep(0); setCompletedSteps(new Set()); }}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
            >
              <ChefHat className="w-4 h-4" /> Start Cooking
            </button>
          </div>
        </section>
      )}

      {/* Cooking Mode Overlay */}
      {cookingMode && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-12 pb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400">Cooking Mode</p>
              <p className="text-white font-semibold text-base mt-0.5">{SAMPLE_RECIPE.title}</p>
            </div>
            <button
              onClick={() => setCookingMode(false)}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white"
            >
              ✕
            </button>
          </div>

          {/* Progress bar */}
          <div className="px-5 pb-3">
            <div className="flex justify-between text-[11px] text-white/40 mb-1.5">
              <span>Step {currentStep + 1} of {SAMPLE_RECIPE.steps.length}</span>
              <span>{progress}% done</span>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex gap-1.5 mt-2">
              {SAMPLE_RECIPE.steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  className="h-1 rounded-full transition-all"
                  style={{
                    flex: i === currentStep ? 2 : 1,
                    background: completedSteps.has(i) ? '#78836B' : i === currentStep ? '#f97316' : 'rgba(255,255,255,0.15)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Step card */}
          <div className="flex-1 px-5 flex flex-col justify-center">
            <div className={`p-5 rounded-2xl border transition-all ${
              completedSteps.has(currentStep)
                ? 'bg-emerald-950/40 border-emerald-800/40'
                : 'bg-white/5 border-white/10'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white ${
                  completedSteps.has(currentStep) ? 'bg-emerald-600' : 'bg-orange-500'
                }`}>
                  {completedSteps.has(currentStep)
                    ? <CheckCircle className="w-5 h-5" />
                    : <span>{currentStep + 1}</span>
                  }
                </div>
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">Step {currentStep + 1}</p>
                  {SAMPLE_RECIPE.steps[currentStep].durationMinutes && (
                    <p className="text-[11px] text-orange-400 flex items-center gap-1">
                      <Timer className="w-3 h-3" /> {SAMPLE_RECIPE.steps[currentStep].durationMinutes} min
                    </p>
                  )}
                </div>
              </div>
              <p className="text-white text-sm leading-relaxed">
                {SAMPLE_RECIPE.steps[currentStep].instruction}
              </p>
              {SAMPLE_RECIPE.steps[currentStep].tip && (
                <p className="mt-3 text-[11px] text-amber-400/80 bg-amber-500/10 rounded-lg px-3 py-2">
                  💡 {SAMPLE_RECIPE.steps[currentStep].tip}
                </p>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-3 px-5 pb-10 pt-4">
            <button
              onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
              disabled={currentStep === 0}
              className="flex-1 py-3.5 rounded-xl bg-white/8 border border-white/10 text-white/60 text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            {currentStep < SAMPLE_RECIPE.steps.length - 1 ? (
              <button
                onClick={markStepDone}
                className="flex-2 flex-[2] py-3.5 rounded-xl bg-white text-slate-900 text-sm font-bold flex items-center justify-center gap-1.5"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => { markStepDone(); setCookingMode(false); }}
                className="flex-[2] py-3.5 rounded-xl bg-emerald-600 text-white text-sm font-bold flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" /> Done! Enjoy 🎉
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
