'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Plus, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useIngredients } from '@/app/lib/IngredientContext'
import { useAuth } from '@/app/auth/AuthContext'
import { RecipeIngredient, RecipeInstructions, Ingredient, Recipe } from '@/app/lib/types'
import { timerUnits, actions, measurementUnits, allTags} from '@/app/lib/cooking'
import { useParams } from 'next/navigation';
import Select from 'react-select'

export default function RecipeUploadForm() {
  const router = useRouter()

  const params = useParams();
  const recipeId = params?.id as string | undefined;
  const isEditMode = !!recipeId;
  const [loadingRecipe, setLoadingRecipe] = useState(false);

  const { user, loading } = useAuth()
  const { ingredients, loadingIngredients } = useIngredients()

  const [recipeName, setRecipeName] = useState<string>('');
  const [servings, setServings] = useState<number>(0);
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [openTags, setOpenTags] = useState<boolean>(false)

  const [prepTimeHrs, setPrepTimeHrs] = useState<number>(0);
  const [prepTimeMins, setPrepTimeMins] = useState<number>(0);
  const [cookTimeHrs, setCookTimeHrs] = useState<number>(0);
  const [cookTimeMins, setCookTimeMins] = useState<number>(0);

  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([{
    ingredient: null,
    amount: 0,
    measurment: 'cups'
  }])
  const [instructions, setInstructions] = useState<RecipeInstructions[]>([
    { id: 1, order: 1, action: '', timer_duration: 30, timer_unit: 'minutes', text: '' }
  ]);

  useEffect(() => {
    if (isEditMode && recipeId) {
      fetchRecipeForEdit(recipeId);
    }
  }, [isEditMode, recipeId]);

  const fetchRecipeForEdit = async (id: string) => {
    setLoadingRecipe(true);
    try {
      const response = await fetch(`/api/recipes/${id}`);
      const data = await response.json();
      
      if (response.ok) {
        console.log('response ok', data)
        console.log('public?', data.is_public)
        // Transform and populate form state
        populateFormWithRecipeData(data);
      }
    } catch (error) {
      console.error('Error fetching recipe:', error);
      alert('Failed to load recipe');
      router.push('/recipe');
    } finally {
      setLoadingRecipe(false);
    }
  };

  const populateFormWithRecipeData = (recipe: Recipe) => {
    // Transform and set all state
    setRecipeName(recipe.name);
    setServings(recipe.servings);
    console.log('public?', recipe.is_public)
    setIsPublic(recipe.is_public)
    
    // Split time into hrs/mins
    setPrepTimeHrs(Math.floor(recipe.prep_time_mins / 60));
    setPrepTimeMins(recipe.prep_time_mins % 60);
    setCookTimeHrs(Math.floor(recipe.cook_time_mins / 60));
    setCookTimeMins(recipe.cook_time_mins % 60);
    
    setIsPublic(recipe.is_public);
    setSelectedTags(recipe.tags || []);
    
    // Transform ingredients
    setRecipeIngredients(recipe.ingredients || [])

    // Transform instructions
    setInstructions(recipe.instructions || [])
  };

  const updateTime = (field: 'cook' | 'prep', value: number) => {
    const setters = {
      cook: { setMins: setCookTimeMins },
      prep: { setMins: setPrepTimeMins }
    };
  
    const { setMins } = setters[field];
  
    if (value >= 60) {
      const remainingMins = value % 60;
      setMins(remainingMins);
    } else if (value < 0) {
      setMins(59);
    } else {
      setMins(value)
    }
  };

  const ingredientOptions = ingredients.map(ingredient => ({
    value: ingredient.id,
    label: ingredient.ingredient,
    data: ingredient
  }))

  const measurementOptions = measurementUnits.map(unit => ({
    value: unit,
    label: unit
  }));

  const actionOptions = actions.map(action => ({
    value: action,
    label: action
  }));

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const addIngredient = () => {
    setRecipeIngredients([...recipeIngredients, { 
      ingredient: null, 
      amount: 0, 
      measurment: '' 
    }]);
  };

  const removeIngredient = (index: number) => {
    setRecipeIngredients(recipeIngredients.filter((_, i) => i !== index));
  };

  useEffect(() => {
    console.log('updated ingredient', recipeIngredients)
  }, [recipeIngredients])
  

  const updateIngredient = (index: number, field: string, value: number | string | Ingredient) => {

    if (field === 'amount' && typeof value === 'number' && value < 0) {
      value = 0
    }

    setRecipeIngredients(recipeIngredients.map((ing, i) => 
      i === index ? { ...ing, [field]: value } : ing
    ));
  };

  const addInstruction = () => {
    const newOrder = instructions.length + 1;
    setInstructions([...instructions, { 
      id: Date.now(), 
      order: newOrder, 
      action: '',
      timer_duration: 30,
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

  const updateInstruction = (id: number, field: string, value: string | number) => {
    if (field == 'timer_duration' && typeof value === 'number' && value < 0) {
      value = 0
    }
    
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

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!recipeName.trim()) {
        alert('Please enter a recipe name');
        return;
      }
  
      if (recipeIngredients.filter(ing => ing.ingredient).length === 0) {
        alert('Please add at least one ingredient');
        return;
      }
  
      if (instructions.filter(inst => inst.text.trim()).length === 0) {
        alert('Please add at least one instruction');
        return;
      }
  
      // Convert time to total minutes
      const prep_time_mins = (prepTimeHrs * 60) + prepTimeMins;
      const cook_time_mins = (cookTimeHrs * 60) + cookTimeMins;
  
      // Format ingredients - include the name for embedding generation
      const formattedIngredients = recipeIngredients
        .filter(ing => ing.ingredient !== null)
        .map(ing => ({
          ingredient_id: ing.ingredient!.id,
          ingredient_name: ing.ingredient!.ingredient, // Send the name too!
          quantity: ing.amount,
          unit: ing.measurment
        }));
  
      // Format instructions for database
      const formattedInstructions = instructions
        .filter(inst => inst.text.trim())
        .map(inst => ({
          order: inst.order,
          action: inst.action,
          timer_duration: inst.timer_duration,
          timer_unit: inst.timer_unit,
          text: inst.text
        }));
  
      const recipeData = {
        name: recipeName,
        servings: servings || null,
        prep_time_mins,
        cook_time_mins,
        difficulty: 'easy',
        is_public: isPublic,
        tags: selectedTags,
        ingredients: formattedIngredients,
        instructions: formattedInstructions
      };
  
      console.log('Submitting recipe:', recipeData);

      const url = isEditMode ? `/api/recipes/${recipeId}` : '/api/recipes';
      const method = isEditMode ? 'PUT' : 'POST';
  
  
      // Submit to API
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipeData)
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save recipe');
      }
  
      alert('Recipe published successfully! 🎉');
      console.log('Recipe saved with ID:', result.recipe_id);
      
      router.push('/dashboard');
      
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Failed to save recipe. Please try again.');
    }
  };

  if (loadingRecipe) {
    return <div>Loading recipe...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
        <button 
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            go to dashboard
          </button>
          <h1
          className="text-3xl font-bold text-gray-800 mb-6"
          >{isEditMode ? 'Edit Recipe' : 'Upload Recipe'}</h1>

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
                  onChange={(e) => setServings(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prep Time
                </label>
                <div className='w-full flex'>
                <input
                  type="number"
                  value={prepTimeHrs}
                  onChange={(e) => setPrepTimeHrs(Number(e.target.value))}
                  className="w-full flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent mr-1"
                  placeholder="15 min"
                />
                <input
                  type="number"
                  value={prepTimeMins}
                  onChange={(e) => updateTime('prep', Number(e.target.value))}
                  className="w-full flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="15 min"
                />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cook Time
                </label>
                <div className='w-full flex'>
                <input
                  type="number"
                  value={cookTimeHrs}
                  onChange={(e) => setCookTimeHrs(Number(e.target.value))}
                  className="w-full flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent mr-1"
                  placeholder="15 min"
                />
                <input
                  type="number"
                  value={cookTimeMins}
                  onChange={(e) => updateTime('cook', Number(e.target.value))}
                  className="w-full flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="15 min"
                />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              {openTags ? <ChevronDown onClick={() => setOpenTags(false)}/> : <ChevronUp onClick={() => setOpenTags(true)}/>}
              {openTags &&
                <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg max-h-64 overflow-y-auto">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-orange-500 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:border-orange-500'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              }
              {selectedTags.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  Selected: {selectedTags.join(', ')}
                </div>
              )}
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
                {recipeIngredients.map((ingredient, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Select
                      options={ingredientOptions}
                      placeholder="Select an ingredient..."
                      isSearchable
                      value={ingredient.ingredient ? { 
                        value: ingredient.ingredient.id, 
                        label: ingredient.ingredient.ingredient,
                        data: ingredient.ingredient
                      } : null}
                      onChange={(selectedOption) => {
                        if (selectedOption) {
                          const ingredient = selectedOption.data
                          updateIngredient(i, 'ingredient', ingredient)
                        }
                      }}
                      styles={{
                        control: (base) => ({
                          ...base,
                          borderColor: '#d1d5db',
                          '&:hover': { borderColor: '#6366f1' },
                          '&:focus': { borderColor: '#6366f1', boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.2)' }
                        })
                      }}
                    />

                    <input
                      type="number"
                      value={ingredient.amount}
                      min={0}
                      onChange={(e) => updateIngredient(i, 'amount', Number(e.target.value))}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:text-gray"
                      placeholder="2"
                    />
                    <Select
                      value={measurementOptions.find(opt => opt.value === ingredient.measurment)}
                      onChange={(selected) => {
                        if (selected) {
                          updateIngredient(i, 'measurment', selected.value);
                        }
                      }}
                      options={measurementOptions}
                      className="w-32"
                      styles={{
                        control: (base) => ({
                          ...base,
                          borderColor: '#d1d5db',
                          borderRadius: '0.5rem',
                          '&:hover': {
                            borderColor: '#f97316'
                          }
                        })
                      }}
                    />
                    <button
                      onClick={() => removeIngredient(i)}
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

                        <Select
                          value={actionOptions.find(opt => opt.value === instruction.action)}
                          onChange={(selected) => {
                            if (selected) {
                              updateInstruction(instruction.id, 'action', selected.value);
                            }
                          }}
                          options={actionOptions}
                          className="w-32"
                          styles={{
                            control: (base) => ({
                              ...base,
                              borderColor: '#d1d5db',
                              borderRadius: '0.5rem',
                              '&:hover': {
                                borderColor: '#f97316'
                              }
                            })
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Timer (optional)
                          </label>
                          <input
                            type="number"
                            value={instruction.timer_duration}
                            min={0}
                            onChange={(e) => updateInstruction(instruction.id, 'timer_duration', Number(e.target.value))}
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