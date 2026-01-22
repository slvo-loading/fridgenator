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
        ).order('order')
        is_saved: saved_recipes!left(id)
        `)
      .eq('id', id)
      .eq('is_public', true)
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