import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../lib/supabaseServer'

// fetch all fridge items for logged in user
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('fridge_items')
    .select('*')
    .eq('user_id', user.id)
    .order('expiration_date', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ items: data })
}

// add a new fridge item
export async function POST(request: NextRequest) {
    console.log('in post')
    const supabase = await createClient()
    console.log('got client i think')
  
    const { data: { user } } = await supabase.auth.getUser()
    console.log('data from user')
  
    if (!user) {
        console.log('theres no user???', user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  
    try {
      console.log('reading request')
      const body = await request.json()
      const { name, amount, measurement, expiration_date } = body
  
      if (!name || !amount || !measurement || !expiration_date) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }
  
      console.log('inserting')
      const { data, error } = await supabase
        .from('fridge_items')
        .insert([{
          user_id: user.id,
          name,
          amount,
          measurement,
          expiration_date
        }])
        .select()
        .single()
  
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
  
      return NextResponse.json({ item: data })
    } catch (error) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
}