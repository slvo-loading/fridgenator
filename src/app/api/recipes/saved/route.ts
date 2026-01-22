// app/api/recipes/saved/route.ts - Get user's saved recipes
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabaseServer';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Join saved_recipes with recipes to get full recipe info
    const { data: savedRecipes, error } = await supabase
      .from('saved_recipes')
      .select(`
        recipes (
          id,
          name,
          servings,
          prep_time_mins,
          cook_time_mins,
          difficulty,
          tags,
          created_at,
          user_id,
          ingredients: recipe_ingredients (
            ingredient: ingredients (
              id,
              ingredient,
              description
            ),
            amount: quantity,
            measurment: unit
          )
        ),
        saved_at
      `)
      .eq('user_id', user.id)
      .order('saved_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Flatten the structure
    const recipes = savedRecipes?.map(item => ({
      ...item.recipes,
      saved_at: item.saved_at
    })) || [];

    console.log(recipes)

    return NextResponse.json({ recipes });

  } catch (error) {
    console.error('Error fetching saved recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved recipes' },
      { status: 500 }
    );
  }
}
