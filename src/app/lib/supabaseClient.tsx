
import { createBrowserClient } from '@supabase/ssr' // ← Use browser client!

  // Create browser client for client components
  export const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )