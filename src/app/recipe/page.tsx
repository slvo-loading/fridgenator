'use client'

import React, { useState, useEffect } from 'react';
import { Clock, Users, ChefHat, BookmarkPlus, BookmarkCheck, Search, Bookmark } from 'lucide-react';
import { Recipe } from '../lib/types'
import { useRouter } from 'next/navigation'


export default function RecipesBrowsePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('browse');

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRecipes();
  }, [activeTab]);

  useEffect(() => {
    console.log(recipes)
  }, [recipes])

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      switch (activeTab) {
        case 'browse':
          endpoint = '/api/recipes';
          break;
        case 'my-recipes':
          endpoint = '/api/recipes/my-recipes';
          break;
        case 'saved':
          endpoint = '/api/recipes/saved';
          break;
      }

      const response = await fetch(endpoint);
      const data = await response.json();
      setRecipes(data.recipes || []);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeClick = (recipeId: string) => {
    // Navigate to recipe detail page
    router.push(`/recipe/${recipeId}`)
  };

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatTime = (mins: number) => {
    if (!mins) return 'N/A';
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  };

  // Save a recipe
  async function saveRecipe(recipeId: string) {
    try {
      const response = await fetch(`/api/recipes/saved/${recipeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to save recipe');
      }
      
      const data = await response.json();

      setRecipes(prevRecipes => 
        prevRecipes.map(recipe => 
          recipe.id === recipeId 
            ? { ...recipe, is_saved: data.is_saved }
            : recipe
        )
      );

      console.log('Recipe saved:', data);
      return data;
    } catch (error) {
      console.error('Error saving recipe:', error);
    }
  }

  // Unsave a recipe
  async function unsaveRecipe(recipeId: string) {
    try {
      const response = await fetch(`/api/recipes/saved/${recipeId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to unsave recipe');
      }
      
      const data = await response.json();

      setRecipes(prevRecipes => 
        prevRecipes.map(recipe => 
          recipe.id === recipeId 
            ? { ...recipe, is_saved: data.is_saved }
            : recipe
        )
      );

      console.log('Recipe unsaved:', data);
      return data;
    } catch (error) {
      console.error('Error unsaving recipe:', error);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Recipes</h1>
          <p className="text-gray-600">Discover, create, and save your favorite recipes</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'browse'
                ? 'text-orange-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Browse Recipes
            {activeTab === 'browse' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('my-recipes')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'my-recipes'
                ? 'text-orange-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            My Recipes
            {activeTab === 'my-recipes' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'saved'
                ? 'text-orange-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Saved Recipes
            {activeTab === 'saved' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600"></div>
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search recipes by name or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <p className="mt-4 text-gray-600">Loading recipes...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredRecipes.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <ChefHat className="mx-auto mb-4 text-gray-400" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchQuery ? 'No recipes found' : 'No recipes yet'}
            </h3>
            <p className="text-gray-500">
              {activeTab === 'my-recipes' && !searchQuery && 'Create your first recipe to get started!'}
              {activeTab === 'saved' && !searchQuery && 'Save recipes to find them here later'}
              {activeTab === 'browse' && !searchQuery && 'Check back later for new recipes'}
              {searchQuery && 'Try adjusting your search terms'}
            </p>
            {activeTab === 'my-recipes' && !searchQuery && (
              <button
                onClick={() => router.push('/recipe/form')}
                className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Create Recipe
              </button>
            )}
          </div>
        )}

        {/* Recipe Grid */}
        {!loading && filteredRecipes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => {
              const totalTime = (recipe.prep_time_mins || 0) + (recipe.cook_time_mins || 0);
              
              return (
                <div
                  key={recipe.id}
                  onClick={() => handleRecipeClick(recipe.id)}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
                >
                  {/* Recipe Image Placeholder */}
                  <div className="h-48 bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center group-hover:from-orange-500 group-hover:to-amber-500 transition-colors">
                    <ChefHat size={64} className="text-white opacity-50" />
                  </div>

                  {/* Recipe Info */}
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                      {recipe.name}
                    </h3>

                    {/* Meta Info */}
                    <div className="flex gap-4 text-sm text-gray-600 mb-3">
                      {recipe.servings && (
                        <div className="flex items-center gap-1">
                          <Users size={16} />
                          <span>{recipe.servings}</span>
                        </div>
                      )}
                      {totalTime > 0 && (
                        <div className="flex items-center gap-1">
                          <Clock size={16} />
                          <span>{formatTime(totalTime)}</span>
                        </div>
                      )}
                      {recipe.difficulty && (
                        <div className="flex items-center gap-1 capitalize">
                          <ChefHat size={16} />
                          <span>{recipe.difficulty}</span>
                        </div>
                      )}
                      {recipe.is_saved &&
                        <div>
                          {recipe.is_saved.length > 0 ? (
                            <button
                            onClick={(e) => {
                              e.stopPropagation();
                              unsaveRecipe(recipe.id)}}
                            ><Bookmark fill="currentColor" className="text-orange-500" size={20}/></button>
                          ) : (
                            <button
                            onClick={(e) => {
                              e.stopPropagation();
                              saveRecipe(recipe.id)}}
                            ><Bookmark className="text-orange-500" size={20}/></button>
                          )}
                        </div>
                      }
                    </div>

                    {/* Tags */}
                    {recipe.tags && recipe.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {recipe.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {recipe.tags.length > 3 && (
                          <span className="px-2 py-1 text-gray-500 text-xs">
                            +{recipe.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        {new Date(recipe.created_at).toLocaleDateString()}
                      </span>
                      {activeTab === 'my-recipes' && recipe.is_public !== undefined && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          recipe.is_public 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {recipe.is_public ? 'Public' : 'Private'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}