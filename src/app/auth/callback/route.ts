
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '../../lib/supabaseServer'


export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()

    // Exchange code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Redirect to dashboard after successful auth
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  // If error or no code, go back to home
  return NextResponse.redirect(`${origin}/`)
}