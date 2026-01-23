import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabaseServer'

// fetch all recipes
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
      
        const { data: { user } } = await supabase.auth.getUser()
  
        if (!user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
  
      const { data: recipes, error } = await supabase
        .from('recipes')
        .select(`
          id,
          name,
          servings,
          prep_time_mins,
          cook_time_mins,
          difficulty,
          tags,
          created_at,
          user_id,
          ingredients: recipe_ingredients(
            ingredient: ingredients(
                id,
                ingredient,
                description
            ),
            amount: quantity,
            measurment: unit
          ),
          is_saved: saved_recipes!left(id)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });
  
      if (error) {
        throw error;
      }

      console.log(recipes)
  
      return NextResponse.json({ recipes });
  
    } catch (error) {
      console.error('Error fetching public recipes:', error);
      return NextResponse.json(
        { error: 'Failed to fetch recipes' },
        { status: 500 }
      );
    }
  }
  

export async function POST(request: NextRequest) {
    console.log('inside post api')
    try {
      const supabase = await createClient()
      
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
  
      const body = await request.json();
      const { 
        name, 
        servings, 
        prep_time_mins, 
        cook_time_mins, 
        difficulty,
        is_public,
        tags,
        ingredients, // [{ ingredient_id, ingredient_name, quantity, unit }]
        instructions
      } = body;
  
      if (!name || !ingredients || ingredients.length === 0 || !instructions || instructions.length === 0) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }
  
      // 1. Insert recipe
      console.log('inserting into database initial data')
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .insert({
          user_id: user.id,
          name,
          servings,
          prep_time_mins,
          cook_time_mins,
          difficulty,
          is_public,
          tags
        })
        .select()
        .single();
  
      if (recipeError) {
        console.error('Recipe insert error:', recipeError);
        throw recipeError;
      }
      
      console.log('generating embeddings')
      // 2. Generate embedding - use the ingredient names we already have!
      const ingredientNames = ingredients.map((i: any) => i.ingredient_name).join(' ');
      const instructionTexts = instructions.map((i: any) => i.text).join(' ');
      const embeddingText = `${name} ${ingredientNames} ${instructionTexts}`;
  
      const embedding = await generateEmbedding(embeddingText)
  
      console.log('inserting embedding')
      // 3. Update recipe with embedding
      const { error: embeddingError } = await supabase
        .from('recipes')
        .update({ embedding })
        .eq('id', recipe.id);
  
      if (embeddingError) {
        console.error('Embedding update error:', embeddingError);
      }
      
      
      // 4. Insert ingredients (don't save ingredient_name to DB)
      const ingredientInserts = ingredients.map((ing: any) => ({
        recipe_id: recipe.id,
        ingredient_id: ing.ingredient_id,
        quantity: ing.quantity,
        unit: ing.unit
      }));
  
      const { error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .insert(ingredientInserts);
  
      if (ingredientsError) {
        console.error('Recipe ingredients insert error:', ingredientsError);
        throw ingredientsError;
      }
  
      // 5. Insert instructions
      const instructionInserts = instructions.map((inst: any) => ({
        recipe_id: recipe.id,
        order: inst.order,
        action: inst.action,
        timer_duration: inst.timer_duration,
        timer_unit: inst.timer_unit,
        text: inst.text
      }));
  
      const { error: instructionsError } = await supabase
        .from('recipe_instructions')
        .insert(instructionInserts);
  
      if (instructionsError) {
        console.error('Recipe instructions insert error:', instructionsError);
        throw instructionsError;
      }
  
      return NextResponse.json({ 
        success: true, 
        recipe_id: recipe.id 
      });
  
    } catch (error) {
      console.error('Error saving recipe:', error);
      return NextResponse.json(
        { error: 'Failed to save recipe', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  }


async function generateEmbedding(text: string): Promise<number[]> {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text
      })
    })
  
    const data = await response.json()
    return data.data[0].embedding
  }