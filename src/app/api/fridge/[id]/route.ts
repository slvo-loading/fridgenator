import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../lib/supabaseServer'

// DELETE /api/fridge/[id] - Delete a specific fridge item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  // Delete the item (only if it belongs to this user)
  const { error } = await supabase
    .from('fridge_items')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id) // Security: ensure user owns this item

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}