'use client'
import { Recipe } from '@/app/lib/types'

export default function OutroSlide({ recipe } : { recipe: Recipe}) {
    return (
      <div className="max-w-3xl mx-auto text-center animate-fadeIn">
        <div className="text-9xl mb-8 animate-bounce">🎉</div>
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
          You're All Done!
        </h1>
        <p className="text-3xl text-gray-300 mb-12">
          Your <span className="text-orange-400 font-semibold">{recipe.name}</span> is ready to enjoy!
        </p>
        
        <div className="flex gap-4 justify-center flex-wrap">
          <button className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl text-xl font-semibold transition-all transform hover:scale-105 shadow-lg">
            View Recipe Again
          </button>
          <button className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xl font-semibold transition-all">
            Back to Recipes
          </button>
        </div>
        
        <div className="mt-12 text-gray-500">
          Hope you enjoyed cooking! 🧑‍🍳
        </div>
      </div>
    );
  }