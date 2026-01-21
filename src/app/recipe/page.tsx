'use client'

import React, { useState } from 'react';
import { Plus, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useIngredients } from '../lib/IngredientContext'
import { Ingredient } from '../lib/types'

export default function RecipeUploadForm() {
  const { ingredients, loadingIngredients } = useIngredients()
  const [recipeName, setRecipeName] = useState<string>('');
  const [servings, setServings] = useState<number>(0);
  const [prepTime, setPrepTime] = useState<number>(0);
  const [cookTime, setCookTime] = useState<number>(0);
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState('');
  const [recipeIngredients, setRecipeIngredients] = useState<Ingredient[]>([])
  const [instructions, setInstructions] = useState([
    { id: 1, order: 1, action: '', timer_duration: '', timer_unit: 'minutes', text: '' }
  ]);


  const actions = [
    'Mix', 'Stir', 'Whisk', 'Fold', 'Beat',
    'Chop', 'Dice', 'Slice', 'Mince',
    'Sauté', 'Fry', 'Boil', 'Simmer', 'Steam',
    'Bake', 'Roast', 'Grill', 'Broil',
    'Knead', 'Roll', 'Shape',
    'Let rest', 'Chill', 'Freeze',
    'Serve', 'Garnish', 'Plate'
  ];

  const timerUnits = ['seconds', 'minutes', 'hours'];

  const addIngredient = () => {
    const timestamp = Date.now();
    const dateObject = new Date(timestamp);
    const dateString = dateObject.toString()

    setIngredients([...ingredients, { 
      id: dateString, 
      name: '', 
      quantity: '', 
      unit: '' 
    }]);
  };

  const removeIngredient = (id: string) => {
    setIngredients(ingredients.filter(ing => ing.id !== id));
  };

  const updateIngredient = (id: string, field: string, value: string) => {
    setIngredients(ingredients.map(ing => 
      ing.id === id ? { ...ing, [field]: value } : ing
    ));
  };

  const addInstruction = () => {
    const newOrder = instructions.length + 1;
    setInstructions([...instructions, { 
      id: Date.now(), 
      order: newOrder, 
      action: '',
      timer_duration: '',
      timer_unit: 'minutes',
      text: '' 
    }]);
  };

  const removeInstruction = (id: number) => {
    const filtered = instructions.filter(inst => inst.id !== id);
    const reordered = filtered.map((inst, idx) => ({
      ...inst,
      order: idx + 1
    }));
    setInstructions(reordered);
  };

  const updateInstruction = (id: number, field: string, value: string) => {
    setInstructions(instructions.map(inst => 
      inst.id === id ? { ...inst, [field]: value } : inst
    ));
  };

  const moveInstruction = (index: number, direction: string) => {
    const newInstructions = [...instructions];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= newInstructions.length) return;
    
    [newInstructions[index], newInstructions[newIndex]] = 
    [newInstructions[newIndex], newInstructions[index]];
    
    const reordered = newInstructions.map((inst, idx) => ({
      ...inst,
      order: idx + 1
    }));
    
    setInstructions(reordered);
  };

  const handleSubmit = () => {
    const recipeData = {
      name: recipeName,
      servings: parseInt(servings) || null,
      prep_time: prepTime,
      cook_time: cookTime,
      is_public: isPublic,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      ingredients: ingredients.filter(ing => ing.name).map(ing => ({
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit
      })),
      instructions: instructions.filter(inst => inst.text).map(inst => ({
        order: inst.order,
        action: inst.action,
        timer: inst.timer_duration ? {
          duration: parseInt(inst.timer_duration),
          unit: inst.timer_unit
        } : null,
        text: inst.text
      }))
    };
    
    console.log('Recipe to submit:', recipeData);
    alert('Recipe submitted! Check console for data.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Upload Recipe</h1>
          
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipe Name
              </label>
              <input
                type="text"
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g., Grandma's Chocolate Chip Cookies"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servings
                </label>
                <input
                  type="number"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prep Time
                </label>
                <input
                  type="text"
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="15 min"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cook Time
                </label>
                <input
                  type="text"
                  value={cookTime}
                  onChange={(e) => setCookTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="30 min"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="dessert, quick, family-friendly"
              />
            </div>

            {/* Ingredients */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Ingredients
                </label>
                <button
                  onClick={addIngredient}
                  className="flex items-center gap-1 px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
              
              <div className="space-y-2">
                {ingredients.map((ingredient) => (
                  <div key={ingredient.id} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(ingredient.id, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Ingredient name"
                    />
                    <input
                      type="text"
                      value={ingredient.quantity}
                      onChange={(e) => updateIngredient(ingredient.id, 'quantity', e.target.value)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="2"
                    />
                    <input
                      type="text"
                      value={ingredient.unit}
                      onChange={(e) => updateIngredient(ingredient.id, 'unit', e.target.value)}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="cups"
                    />
                    <button
                      onClick={() => removeIngredient(ingredient.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Instructions
                </label>
                <button
                  onClick={addInstruction}
                  className="flex items-center gap-1 px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm"
                >
                  <Plus size={16} />
                  Add Step
                </button>
              </div>
              
              <div className="space-y-3">
                {instructions.map((instruction, index) => (
                  <div key={instruction.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex gap-2 items-start mb-3">
                      <div className="flex flex-col gap-1 pt-1">
                        <button
                          onClick={() => moveInstruction(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button
                          onClick={() => moveInstruction(index, 'down')}
                          disabled={index === instructions.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>
                      <div className="flex items-center justify-center w-8 h-8 bg-orange-500 text-white rounded-lg font-semibold text-sm">
                        {instruction.order}
                      </div>
                      <button
                        onClick={() => removeInstruction(instruction.id)}
                        className="ml-auto p-2 text-red-500 hover:bg-red-100 rounded-lg"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Action Type
                        </label>
                        <select
                          value={instruction.action}
                          onChange={(e) => updateInstruction(instruction.id, 'action', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                        >
                          <option value="">Select an action...</option>
                          {actions.map(action => (
                            <option key={action} value={action.toLowerCase()}>
                              {action}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Timer (optional)
                          </label>
                          <input
                            type="number"
                            value={instruction.timer_duration}
                            onChange={(e) => updateInstruction(instruction.id, 'timer_duration', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="30"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Unit
                          </label>
                          <select
                            value={instruction.timer_unit}
                            onChange={(e) => updateInstruction(instruction.id, 'timer_unit', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                          >
                            {timerUnits.map(unit => (
                              <option key={unit} value={unit}>
                                {unit}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Instructions
                        </label>
                        <textarea
                          value={instruction.text}
                          onChange={(e) => updateInstruction(instruction.id, 'text', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none bg-white"
                          placeholder="Describe this step in detail..."
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="public"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
              />
              <label htmlFor="public" className="text-sm font-medium text-gray-700">
                Make this recipe public (others can view and use it)
              </label>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
            >
              Publish Recipe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}