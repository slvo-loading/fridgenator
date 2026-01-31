'use client'
import { Clock, Users, ChefHat } from 'lucide-react';
import { Recipe } from '@/app/lib/types'

export default function IntroSlide({ recipe } : { recipe:Recipe }) {
    return (
      <div className="max-w-3xl mx-auto text-center animate-fadeIn">
        <div className="mb-8">
          <ChefHat className="w-20 h-20 mx-auto text-orange-500 mb-4" />
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            {recipe.name}
          </h1>
          <div className="inline-block px-4 py-2 bg-orange-500/20 rounded-full text-orange-400 font-medium">
            {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)} Recipe
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-12">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <Clock className="w-8 h-8 mx-auto mb-3 text-orange-400" />
            <div className="text-gray-400 text-sm mb-1">Prep Time</div>
            <div className="text-2xl font-bold">{recipe.prep_time_mins} min</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <Clock className="w-8 h-8 mx-auto mb-3 text-orange-400" />
            <div className="text-gray-400 text-sm mb-1">Cook Time</div>
            <div className="text-2xl font-bold">{recipe.cook_time_mins} min</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <Users className="w-8 h-8 mx-auto mb-3 text-orange-400" />
            <div className="text-gray-400 text-sm mb-1">Servings</div>
            <div className="text-2xl font-bold">{recipe.servings}</div>
          </div>
        </div>
        
        <p className="text-xl text-gray-300 mb-8">
          Ready to start cooking? Let's make something delicious! 👨‍🍳
        </p>
        
        <div className="text-gray-500 text-sm">
          Press <kbd className="px-2 py-1 bg-white/10 rounded">→</kbd> or click Next to begin
        </div>
      </div>
    );
  }