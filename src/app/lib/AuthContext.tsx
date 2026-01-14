'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { supabase } from './supabaseClient'

interface AuthContextType {
  user: User | null
  isAdmin: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  loading: true,
})

export const useAuth = () => useContext(AuthContext)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()


    const checkAdminStatus = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('admins')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle()
          .throwOnError()
  
        return !!data
      } catch (error) {
        console.error('Error checking admin status:', error)
        return false
      }
    }

  useEffect(() => {

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log('Auth state changed:', _event, session) // Debug

        if (session?.user) {
          const adminStatus = await checkAdminStatus(session.user.id)
          setIsAdmin(adminStatus)
        } else {
          setIsAdmin(false)
        }

        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])


  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) console.error('Error:', error)
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Error:', error)
    router.push('/')
  }

  useEffect(() => {
    console.log('is admin', isAdmin)
  }, [isAdmin])

  const value = {
    user,
    isAdmin,
    signInWithGoogle,
    signOut,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}