// app/api/recipes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabaseServer';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
        );
    }

    const { id } = await params

    // Fetch the recipe
    const { data: recipe, error: recipeError } = await supabase
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
        is_saved: saved_recipes!left(id),
        is_public,
        ingredients: recipe_ingredients(
            ingredient: ingredients(
                id,
                ingredient,
                description
            ),
            amount: quantity,
            measurment: unit
        ),
        instructions: recipe_instructions(
            id,
            order,
            action,
            timer_duration,
            timer_unit,
            text
        ).order('order'),
        `)
      .eq('id', id)
      .single();

      if (recipeError) {
        throw recipeError;
      }

      console.log(recipe)

    return NextResponse.json(recipe);

  } catch (error) {
    console.error('Error fetching recipe:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipe' },
      { status: 500 }
    );
  }
}

// delete a recipe
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { id } = await params

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete the recipe (cascade will handle ingredients and instructions)
    const { error: deleteError } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      message: 'Recipe deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json(
      { error: 'Failed to delete recipe' },
      { status: 500 }
    );
  }
}


// edit a recipe
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { id } = await params

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      instructions // [{ order, action, timer_duration, timer_unit, text }]
    } = body;

    // Validate required fields
    if (!name || !ingredients || ingredients.length === 0 || !instructions || instructions.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if recipe exists and user owns it
    const { data: existingRecipe, error: fetchError } = await supabase
      .from('recipes')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingRecipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    if (existingRecipe.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only edit your own recipes' },
        { status: 403 }
      );
    }

    // 1. Update recipe
    const { error: recipeError } = await supabase
      .from('recipes')
      .update({
        name,
        servings,
        prep_time_mins,
        cook_time_mins,
        difficulty,
        is_public,
        tags,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (recipeError) {
      console.error('Recipe update error:', recipeError);
      throw recipeError;
    }

    // 2. Generate new embedding
    const ingredientNames = ingredients.map((i: any) => i.ingredient_name).join(' ');
    const instructionTexts = instructions.map((i: any) => i.text).join(' ');
    const embeddingText = `${name} ${ingredientNames} ${instructionTexts}`;

    const embedding = await generateEmbedding(embeddingText);

    // 3. Update recipe with new embedding
    const { error: embeddingError } = await supabase
      .from('recipes')
      .update({ embedding })
      .eq('id', id);

    if (embeddingError) {
      console.error('Embedding update error:', embeddingError);
    }

    // 4. Delete old ingredients and insert new ones
    const { error: deleteIngredientsError } = await supabase
      .from('recipe_ingredients')
      .delete()
      .eq('recipe_id', id);

    if (deleteIngredientsError) {
      console.error('Delete ingredients error:', deleteIngredientsError);
    }

    const ingredientInserts = ingredients.map((ing: any) => ({
      recipe_id: id,
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

    // 5. Delete old instructions and insert new ones
    const { error: deleteInstructionsError } = await supabase
      .from('recipe_instructions')
      .delete()
      .eq('recipe_id', id);

    if (deleteInstructionsError) {
      console.error('Delete instructions error:', deleteInstructionsError);
    }

    const instructionInserts = instructions.map((inst: any) => ({
      recipe_id: id,
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
      recipe_id: id,
      message: 'Recipe updated successfully'
    });

  } catch (error) {
    console.error('Error updating recipe:', error);
    return NextResponse.json(
      { error: 'Failed to update recipe', details: error instanceof Error ? error.message : 'Unknown error' },
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