'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Plus, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useIngredients } from '@/app/lib/IngredientContext'
import { useAuth } from '@/app/auth/AuthContext'
import { RecipeIngredient, RecipeInstructions, Ingredient, Recipe } from '@/app/lib/types'
import { timerUnits, actions, measurementUnits, allTags, fractionOptions} from '@/app/lib/cooking'
import { useParams } from 'next/navigation';
import Select from 'react-select'


export default function RecipeUploadForm() {
  const router = useRouter()

  const params = useParams();
  const recipeId = params?.id as string | undefined;
  const isEditMode = recipeId !== 'new';
  const [loadingRecipe, setLoadingRecipe] = useState(false);

  const { user, loading } = useAuth()
  const { ingredients, loadingIngredients } = useIngredients()

  const [recipeName, setRecipeName] = useState<string>('');
  const [servings, setServings] = useState<string>('');
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [openTags, setOpenTags] = useState<boolean>(false)
  const [difficulty, setDifficulty] = useState<string>('easy')

  const [prepTimeHrs, setPrepTimeHrs] = useState<string>('');
  const [prepTimeMins, setPrepTimeMins] = useState<string>('');
  const [cookTimeHrs, setCookTimeHrs] = useState<string>('');
  const [cookTimeMins, setCookTimeMins] = useState<string>('');

  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([{
    ingredient: null,
    amount: '',
    measurment: ''
  }])
  const [instructions, setInstructions] = useState<RecipeInstructions[]>([
    { id: 1, order: 1, action: '', timer_hrs: '', timer_mins: '', timer_secs: '', text: '' }
  ]);


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
    console.log(recipeIngredients)
  }, [recipeIngredients])


  // if no user, go back to dashboard
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);


  // decide whether to fetch recipes or not based on recipeID
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
    setServings(String(recipe.servings));
    setIsPublic(recipe.is_public)
    
    // Split time into hrs/mins
    setPrepTimeHrs(String(Math.floor(recipe.prep_time_mins / 60)));
    setPrepTimeMins(String(recipe.prep_time_mins % 60));
    setCookTimeHrs(String(Math.floor(recipe.cook_time_mins / 60)));
    setCookTimeMins(String(recipe.cook_time_mins % 60));
    
    setSelectedTags(recipe.tags || []);
    setRecipeIngredients(recipe.ingredients || [])
    setInstructions(recipe.instructions || [])
  };


  // meta data
  const updateTime = (field: 'cook' | 'prep', value: string) => {
    const setMins = field === 'cook' ? setCookTimeMins : setPrepTimeMins;
    const numValue = parseNumber(value);
    
    if (numValue >= 60) {
      setMins(String(numValue % 60));
    } else if (numValue < 0) {
      setMins('59');
    } else {
      setMins(value);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };


// ingredients
  const addIngredient = () => {
    setRecipeIngredients([...recipeIngredients, { 
      ingredient: null, 
      amount: '', 
      measurment: '' 
    }]);
  };

  const removeIngredient = (index: number) => {
    setRecipeIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: string, value: string | Ingredient) => {
    setRecipeIngredients(prev => prev.map((ing, i) => 
      i === index ? { ...ing, [field]: value } : ing
    ));
  };


  // instructions
  const addInstruction = () => {
    const newOrder = instructions.length + 1;
    setInstructions([...instructions, { 
      id: Date.now(), 
      order: newOrder, 
      action: '',
      timer_hrs: '',
      timer_mins: '',
      timer_secs: '',
      text: '' 
    }]);
  };

  const removeInstruction = (id: number) => {
    setInstructions(prev => {
      const filtered = prev.filter(inst => inst.id !== id);
      return filtered.map((inst, idx) => ({ ...inst, order: idx + 1 }));
    });
  };

  const updateInstruction = (id: number, field: string, value: string) => {
    let finalValue = value;
    
    // Keep mins and secs under 60
    if (field === 'timer_mins' || field === 'timer_secs') {
      const num = parseNumber(value);
      if (num >= 60 || num === 0) finalValue = '';
      else if (num < 0) finalValue = '59';
    } else if (field === 'timer_hrs' && parseNumber(value) <= 0) {
      finalValue = '';
    }
    
    setInstructions(prev => 
      prev.map(inst => 
        inst.id === id ? { ...inst, [field]: finalValue } : inst
      )
    );
  };

  const moveInstruction = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= instructions.length) return;
    
    setInstructions(prev => {
      const newInstructions = [...prev];
      [newInstructions[index], newInstructions[newIndex]] = 
        [newInstructions[newIndex], newInstructions[index]];
      return newInstructions.map((inst, idx) => ({ ...inst, order: idx + 1 }));
    });
  };


  //helper
  const parseNumber = (value: string | number): number => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
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
      const prep_time_mins = parseNumber(prepTimeHrs) * 60 + parseNumber(prepTimeMins) || 0;
      const cook_time_mins = parseNumber(cookTimeHrs) * 60 + parseNumber(cookTimeMins) || 0;
  
      // Format ingredients - include the name for embedding generation
      const formattedIngredients = recipeIngredients
        .filter(ing => ing.ingredient !== null)
        .map(ing => ({
          ingredient_id: ing.ingredient!.id,
          ingredient_name: ing.ingredient!.ingredient, // Send the name too!
          quantity: parseNumber(ing.amount),
          unit: ing.measurment
        }));
  
      // Format instructions for database
      const formattedInstructions = instructions
        .filter(inst => inst.text.trim())
        .map(inst => ({
          order: inst.order,
          action: inst.action,
          timer_hrs: inst.timer_hrs ? parseNumber(inst.timer_hrs) : null,
          timer_mins: inst.timer_mins ? parseNumber(inst.timer_mins) : null,
          timer_secs: inst.timer_secs ? parseNumber(inst.timer_secs) : null,
          text: inst.text
        }));
  
      const recipeData = {
        name: recipeName,
        servings: servings ? parseNumber(servings) : null,
        prep_time_mins,
        cook_time_mins,
        difficulty: difficulty,
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
      
      router.push('/recipe');
      
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
                  min={1}
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
              >
                  <option value='easy'>
                    easy
                  </option>
                  <option value='medium'>
                    medium
                  </option>
                  <option value='hard'>
                    hard
                  </option>
              </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prep Time (hrs:mins)
                </label>
                <div className='w-full flex'>
                <input
                  type="number"
                  min='0'
                  value={parseNumber(prepTimeHrs) > 0 ? prepTimeHrs : ''}
                  onChange={(e) => setPrepTimeHrs(e.target.value)}
                  className="w-full flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent mr-1"
                  placeholder="0"
                />
                <input
                  type="number"
                  value={parseNumber(prepTimeMins) > 0 ? prepTimeMins : ''}
                  onChange={(e) => updateTime('prep', e.target.value)}
                  className="w-full flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="0"
                />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cook Time (hrs: min)
                </label>
                <div className='w-full flex'>
                <input
                  type="number"
                  min='0'
                  value={parseNumber(cookTimeHrs) > 0 ? cookTimeHrs : ''}
                  onChange={(e) => setCookTimeHrs(e.target.value)}
                  className="w-full flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent mr-1"
                  placeholder="0"
                />
                <input
                  type="number"
                  value={parseNumber(cookTimeMins) > 0 ? cookTimeMins : ''}
                  onChange={(e) => updateTime('cook', e.target.value)}
                  className="w-full flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="0"
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
                          updateIngredient(i, 'amount', '1')
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
                      value={Math.floor(Number(ingredient.amount)) > 0 ? String(Math.floor(Number(ingredient.amount))) : ''}
                      onChange={(e) => {
                        const whole = Number(e.target.value) || 0;
                        const currentAmount = Number(ingredient.amount) || 0;
                        const fractionPart = currentAmount - Math.floor(currentAmount);
                        const newAmount = whole + fractionPart;
                        updateIngredient(i, 'amount', String(newAmount));
                      }}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:text-gray"
                      placeholder="1"
                    />

                    <Select
                      value={fractionOptions.find(opt => {
                        const currentAmount = Number(ingredient.amount) || 0;
                        const fractionPart = currentAmount - Math.floor(currentAmount);
                        return Math.abs(Number(opt.value) - fractionPart) < 0.01; // Close enough match
                      })}
                      onChange={(selected) => {
                        if (selected) {
                          const currentAmount = Number(ingredient.amount) || 0;
                          const whole = Math.floor(currentAmount);
                          const newAmount = whole + Number(selected.value);
                          updateIngredient(i, 'amount', String(newAmount));
                        }
                      }}
                      options={fractionOptions}
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Timer (hr: min: sec)
                          </label>
                          <div className='w-full flex'>
                          <input
                            type="number"
                            min='0'
                            value={instruction.timer_hrs || ''}
                            onChange={(e) => updateInstruction(instruction.id, 'timer_hrs', e.target.value)}
                            className="w-full flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent mr-1"
                            placeholder="0"
                          />
                          <input
                            type="number"
                            value={instruction.timer_mins || ''}
                            onChange={(e) => updateInstruction(instruction.id, 'timer_mins', e.target.value)}
                            className="w-full flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="0"
                          />
                          <input
                            type="number"
                            value={instruction.timer_secs || ''}
                            onChange={(e) => updateInstruction(instruction.id, 'timer_secs', e.target.value)}
                            className="w-full flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="0"
                          />
                        </div>
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

              <button
                  onClick={addInstruction}
                  className="flex items-center gap-1 px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm"
                >
                  <Plus size={16} />
                  Add Step
                </button>
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