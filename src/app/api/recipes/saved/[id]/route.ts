import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabaseServer';

//save a recipe
export async function POST(
    request: NextRequest, 
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()

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
      
      const { data, error } = await supabase
        .from('saved_recipes')
        .insert([{ user_id: user.id, recipe_id: id }])
        .select()
        .single();
      
      if (error) throw error;
      
      return NextResponse.json({ 
        success: true,
        is_saved: [{ id: data.id }] // Format to match your frontend expectation
    });

    } catch (error) {
      const err = error as Error;
      return NextResponse.json(
        { error: err.message },
        { status: 500 }
      );
    }
  }
  
  // DELETE unsave a recipe by recipe_id
  export async function DELETE(
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
      
        const { error } = await supabase
            .from('saved_recipes')
            .delete()
            .eq('user_id', user.id)
            .eq('recipe_id', id);
      
        if (error) throw error;
      
        return NextResponse.json({ 
            success: true,
            is_saved: [] // Empty array means not saved
        });

        } catch (error) {
            const err = error as Error;
            return NextResponse.json(
              { error: err.message },
              { status: 500 }
            );
        }
    }
  