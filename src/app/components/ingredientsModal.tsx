import { useState, useEffect } from 'react'
import { X, Search, Trash2, Loader2 } from 'lucide-react'
import { Ingredient } from '../lib/types'
import { useIngredients } from '../lib/IngredientContext'

interface IngredientsModalProps {
  isOpen: boolean
  onClose: () => void
  isAdmin: boolean
  onSelectIngredient?: (ingredient: Ingredient) => void
}

export default function IngredientsModal({ 
  isOpen, 
  onClose, 
  isAdmin,
  onSelectIngredient 
}: IngredientsModalProps) {
  const { ingredients, loadingIngredients, handleDelete, deleting } = useIngredients()
  const [searchQuery, setSearchQuery] = useState('')


  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">All Ingredients</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Ingredients List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loadingIngredients ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : ingredients.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchQuery ? 'No ingredients found' : 'No ingredients yet'}
            </div>
          ) : (
            <div className="space-y-2">
              {ingredients
              .filter(ingredient => {
                const query = searchQuery.toLowerCase()
                return (
                  ingredient.ingredient.toLowerCase().includes(query) ||
                  ingredient.description?.toLowerCase().includes(query)
                )
              })
              .map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                  onClick={() => onSelectIngredient?.(ingredient)}
                >
                  <div className="flex-1 cursor-pointer">
                    <h3 className="font-semibold text-gray-900">
                      {ingredient.ingredient}
                    </h3>
                    {ingredient.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {ingredient.description}
                      </p>
                    )}
                    {ingredient.pantry_expire && (
                      <p className="text-xs text-gray-500 mt-1">
                        Expires in ~{ingredient.pantry_expire} days in the <b>pantry</b>
                      </p>
                    )}
                    {ingredient.fridge_expire && (
                      <p className="text-xs text-gray-500 mt-1">
                        Expires in ~{ingredient.fridge_expire} days in the <b>fridge</b>
                      </p>
                    )}
                    {ingredient.freezer_expire && (
                      <p className="text-xs text-gray-500 mt-1">
                        Expires in ~{ingredient.freezer_expire} days in the <b>freezer</b>
                      </p>
                    )}
                  </div>

                  {isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(ingredient.id)
                      }}
                      disabled={deleting === ingredient.id}
                      className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deleting === ingredient.id ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Trash2 className="h-5 w-5" />
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}