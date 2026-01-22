'use client'
import React, { useState, useEffect } from 'react';
import { Clock, Users, ChefHat, BookmarkPlus, BookmarkCheck, ArrowLeft, Play } from 'lucide-react';
import { Recipe } from '@/app/lib/types'
import { useParams } from 'next/navigation';

export default function RecipeDetailPage() {
  // Get recipe ID from URL (in real app, use useParams from next/navigation)
  const params = useParams();
  const recipeId = params.id;
  
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [userHasIngredients, setUserHasIngredients] = useState([]);

  useEffect(() => {
    fetchRecipe();
  }, []);

  const fetchRecipe = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/recipes/${recipeId}`);
      const data = await response.json();
      
      if (response.ok) {
        setRecipe(data.recipe);
        setIsSaved(data.recipe.is_saved);
        // TODO: Check which ingredients user has in their fridge
        // setUserHasIngredients(...)
      }
    } catch (error) {
      console.error('Error fetching recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecipe = async () => {
    try {
      const endpoint = isSaved ? '/api/recipes/unsave' : '/api/recipes/save';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipe_id: recipeId })
      });

      if (response.ok) {
        setIsSaved(!isSaved);
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
    }
  };

  const startCookAlong = () => {
    window.location.href = `/cook-along/${recipeId}`;
  };

  const goBack = () => {
    window.history.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-gray-600">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Recipe not found</h2>
          <button
            onClick={goBack}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const totalTime = (recipe.prep_time_mins || 0) + (recipe.cook_time_mins || 0);
  const formatTime = (mins: number) => {
    if (!mins) return 'N/A';
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to recipes</span>
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Hero Image */}
          <div className="h-72 bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center">
            <ChefHat size={96} className="text-white opacity-50" />
          </div>

          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">{recipe.name}</h1>
              
              {/* Meta Info */}
              <div className="flex flex-wrap gap-6 text-gray-600 mb-4">
                {recipe.servings && (
                  <div className="flex items-center gap-2">
                    <Users size={20} className="text-orange-500" />
                    <span>{recipe.servings} servings</span>
                  </div>
                )}
                {recipe.prep_time_mins > 0 && (
                  <div className="flex items-center gap-2">
                    <Clock size={20} className="text-orange-500" />
                    <span>Prep: {formatTime(recipe.prep_time_mins)}</span>
                  </div>
                )}
                {recipe.cook_time_mins > 0 && (
                  <div className="flex items-center gap-2">
                    <Clock size={20} className="text-orange-500" />
                    <span>Cook: {formatTime(recipe.cook_time_mins)}</span>
                  </div>
                )}
                {totalTime > 0 && (
                  <div className="flex items-center gap-2">
                    <Clock size={20} className="text-orange-500" />
                    <span className="font-semibold">Total: {formatTime(totalTime)}</span>
                  </div>
                )}
                {recipe.difficulty && (
                  <div className="flex items-center gap-2">
                    <ChefHat size={20} className="text-orange-500" />
                    <span className="capitalize">{recipe.difficulty}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {recipe.tags && recipe.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {recipe.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={startCookAlong}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Play size={20} />
                Start Cook-Along Mode
              </button>
              <button
                onClick={handleSaveRecipe}
                className={`px-6 py-3 border-2 font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                  isSaved
                    ? 'border-orange-500 bg-orange-500 text-white hover:bg-orange-600'
                    : 'border-orange-500 text-orange-500 hover:bg-orange-50'
                }`}
              >
                {isSaved ? <BookmarkCheck size={20} /> : <BookmarkPlus size={20} />}
                {isSaved ? 'Saved' : 'Save'}
              </button>
            </div>

            {/* Ingredients Section */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Ingredients</h2>
              <div className="bg-orange-50 rounded-lg p-6">
                <ul className="space-y-3">
                  {recipe.ingredients && recipe.ingredients.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        className="mt-1 w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                      />
                      <div className="flex-1">
                        <span className="text-gray-800 font-medium">
                          {item.amount} {item.measurment}
                        </span>
                        <span className="text-gray-700 ml-2">
                          {item.ingredient?.ingredient}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Instructions Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Instructions</h2>
              <div className="space-y-6">
                {recipe.instructions && recipe.instructions.map((step) => (
                  <div key={step.id} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                        {step.order}
                      </div>
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg p-4">
                      {step.action && (
                        <div className="text-sm text-orange-600 font-semibold mb-2 uppercase tracking-wide">
                          {step.action}
                        </div>
                      )}
                      <p className="text-gray-800 leading-relaxed">{step.text}</p>
                      {step.timer_duration && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-2 rounded-md inline-flex">
                          <Clock size={16} className="text-orange-500" />
                          <span className="font-medium">
                            Timer: {step.timer_duration} {step.timer_unit}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Info */}
            <div className="pt-6 border-t border-gray-200 text-sm text-gray-500">
              <p>
                Created on {new Date(recipe.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              {recipe.is_public !== undefined && (
                <p className="mt-1">
                  Visibility: <span className="font-medium">{recipe.is_public ? 'Public' : 'Private'}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}