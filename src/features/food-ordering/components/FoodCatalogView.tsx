'use client';

import React, { useState } from 'react';
import { MOCK_DISHES } from '../data/mockDishes';
import { useCartStore } from '@/store/cartStore';
import { Star, Clock, Flame, Plus, Check } from 'lucide-react';

const CATEGORIES = ['All', 'Burgers', 'Bowls', 'Asian', 'Salads'];

export function FoodCatalogView() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [addedDishId, setAddedDishId] = useState<string | null>(null);
  const addItem = useCartStore((state) => state.addItem);

  const filteredDishes =
    selectedCategory === 'All'
      ? MOCK_DISHES
      : MOCK_DISHES.filter((dish) => dish.category === selectedCategory);

  const handleAddToCart = (dish: (typeof MOCK_DISHES)[0]) => {
    addItem({
      id: dish.id,
      name: dish.name,
      price: dish.price,
      imageUrl: dish.imageUrl,
      source: 'food_menu',
    });

    setAddedDishId(dish.id);
    setTimeout(() => setAddedDishId(null), 1200);
  };

  return (
    <div className="space-y-4">
      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-orange-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Dish Grid */}
      <div className="grid grid-cols-1 gap-3.5">
        {filteredDishes.map((dish) => (
          <div
            key={dish.id}
            className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex gap-3 hover:shadow-md transition-shadow relative overflow-hidden"
          >
            {/* Image */}
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 relative">
              <img
                src={dish.imageUrl}
                alt={dish.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <span className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                {dish.rating}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col justify-between min-w-0">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm truncate">{dish.name}</h3>
                <p className="text-slate-500 text-xs line-clamp-2 mt-0.5 leading-snug">
                  {dish.description}
                </p>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-3 h-3" />
                    {dish.prepTimeMinutes}m
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5">
                    <Flame className="w-3 h-3 text-orange-400" />
                    {dish.calories} kcal
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">
                    ${dish.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleAddToCart(dish)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors active:scale-90 ${
                      addedDishId === dish.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-orange-500 text-white hover:bg-orange-600'
                    }`}
                    aria-label="Add to cart"
                  >
                    {addedDishId === dish.id ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
