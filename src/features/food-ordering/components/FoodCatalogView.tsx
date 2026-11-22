'use client';

import React, { useState, useMemo } from 'react';
import { INDIAN_FOOD_ITEMS, FOOD_CATEGORIES } from '../data/mockDishes';
import { useCartStore } from '@/store/cartStore';
import { Star, Clock, Flame, Plus, Check, Search, Sparkles, SlidersHorizontal } from 'lucide-react';
import { Dish } from '@/types/food';

export function FoodCatalogView() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [addedDishId, setAddedDishId] = useState<string | null>(null);
  const addItem = useCartStore((state) => state.addItem);

  const filteredDishes = useMemo(() => {
    return INDIAN_FOOD_ITEMS.filter((dish) => {
      const matchesCategory =
        selectedCategory === 'All' || dish.category === selectedCategory;
      const matchesSearch =
        dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesVeg = !vegOnly || dish.isVegetarian;

      return matchesCategory && matchesSearch && matchesVeg;
    });
  }, [selectedCategory, searchQuery, vegOnly]);

  const handleAddToCart = (dish: Dish) => {
    addItem({
      id: dish.id,
      name: dish.name,
      price: dish.price,
      imageUrl: dish.imageUrl,
      source: 'food_menu',
    });

    setAddedDishId(dish.id);
    setTimeout(() => setAddedDishId(null), 1000);
  };

  return (
    <div className="space-y-4">
      {/* Search & Veg Filter */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 24 delicious Indian foods & snacks..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center justify-between px-1">
          <div className="text-[11px] text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{filteredDishes.length}</span> dishes
          </div>
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border ${
              vegOnly
                ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                vegOnly ? 'bg-emerald-600 animate-pulse' : 'bg-slate-300'
              }`}
            />
            Pure Veg Only
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
        {FOOD_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-orange-600 text-white shadow-sm shadow-orange-500/20 scale-[1.02]'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Dishes List */}
      {filteredDishes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 p-6 space-y-2">
          <p className="text-sm font-semibold text-slate-700">No dishes found</p>
          <p className="text-xs text-slate-400">
            Try adjusting your search query or removing the Pure Veg filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredDishes.map((dish) => (
            <div
              key={dish.id}
              className="bg-white rounded-2xl p-3 shadow-xs border border-slate-100 flex gap-3 hover:shadow-md transition-all duration-200 relative group overflow-hidden"
            >
              {/* Food Image */}
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative">
                <img
                  src={dish.imageUrl}
                  alt={dish.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <span className="absolute bottom-1 left-1 bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                  {dish.rating}
                </span>

                {dish.isVegetarian && (
                  <span className="absolute top-1 left-1 w-3.5 h-3.5 bg-white/90 rounded-sm border border-emerald-600 flex items-center justify-center p-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  </span>
                )}
              </div>

              {/* Dish Details */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                      {dish.name}
                    </h3>
                  </div>

                  <p className="text-slate-500 text-[11px] line-clamp-2 mt-0.5 leading-tight">
                    {dish.description}
                  </p>

                  {dish.tags && dish.tags.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {dish.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] font-medium bg-orange-50 text-orange-600 px-1.5 py-0.2 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer / Add to Cart */}
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
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
                    <span className="font-extrabold text-xs sm:text-sm text-slate-900">
                      ₹{dish.price}
                    </span>
                    <button
                      onClick={() => handleAddToCart(dish)}
                      className={`h-7 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all active:scale-95 shadow-xs ${
                        addedDishId === dish.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-orange-600 text-white hover:bg-orange-700'
                      }`}
                      aria-label="Add to cart"
                    >
                      {addedDishId === dish.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Added
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" /> Add
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
