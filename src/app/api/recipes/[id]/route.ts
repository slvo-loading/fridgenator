// app/api/recipes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabaseServer';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch the recipe
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', params.id)
      .single();

    if (recipeError) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // Check if user has access (their own recipe or public)
    if (!recipe.is_public && recipe.user_id !== user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch ingredients with ingredient details
    const { data: recipeIngredients, error: ingredientsError } = await supabase
      .from('recipe_ingredients')
      .select(`
        id,
        quantity,
        unit,
        ingredient:ingredients (
          id,
          ingredient,
          category
        )
      `)
      .eq('recipe_id', params.id);

    if (ingredientsError) {
      console.error('Ingredients fetch error:', ingredientsError);
    }

    // Fetch instructions
    const { data: instructions, error: instructionsError } = await supabase
      .from('recipe_instructions')
      .select('*')
      .eq('recipe_id', params.id)
      .order('order', { ascending: true });

    if (instructionsError) {
      console.error('Instructions fetch error:', instructionsError);
    }

    // Check if user has saved this recipe
    let isSaved = false;
    if (user) {
      const { data: savedData } = await supabase
        .from('saved_recipes')
        .select('id')
        .eq('user_id', user.id)
        .eq('recipe_id', params.id)
        .single();
      
      isSaved = !!savedData;
    }

    return NextResponse.json({
      recipe: {
        ...recipe,
        ingredients: recipeIngredients || [],
        instructions: instructions || [],
        is_saved: isSaved
      }
    });

  } catch (error) {
    console.error('Error fetching recipe:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipe' },
      { status: 500 }
    );
  }
}