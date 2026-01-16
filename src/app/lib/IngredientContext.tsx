// contexts/IngredientsContext.tsx
'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from './supabaseClient'
import { Ingredient } from './types'

interface IngredientsContextType {
  ingredients: Ingredient[]
  loadingIngredients: boolean
  deleting: string | null
  handleDelete: (id:string) => Promise<void>
  refreshIngredients: () => Promise<void>
}

const IngredientsContext = createContext<IngredientsContextType>({
  ingredients: [],
  loadingIngredients: true,
  deleting: null,
  handleDelete: async (id) => {},
  refreshIngredients: async () => {}
})

export const useIngredients = () => useContext(IngredientsContext)

interface IngredientsProviderProps {
  children: ReactNode
}

export const IngredientsProvider = ({ children }: IngredientsProviderProps) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loadingIngredients, setLoadingIngredients] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchIngredients = async () => {
    try {
      const response = await fetch('/api/ingredients')
      const data = await response.json()
      
      if (data.items) {
        setIngredients(data.items)
      }
    } catch (error) {
      console.error('Error fetching ingredients:', error)
    } finally {
      setLoadingIngredients(false)
    }
  }

  const refreshIngredients = async () => {
    setLoadingIngredients(true)
    await fetchIngredients()
  }


  useEffect(() => {
    fetchIngredients()

    // Set up real-time subscription for changes
    // const channel = supabase
    //   .channel('ingredients-changes')
    //   .on(
    //     'postgres_changes',
    //     {
    //       event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
    //       schema: 'public',
    //       table: 'ingredients'
    //     },
    //     (payload) => {
    //       console.log('Ingredient changed:', payload)
          
    //       if (payload.eventType === 'INSERT') {
    //         setIngredients(prev => [...prev, payload.new as Ingredient])
    //       } else if (payload.eventType === 'UPDATE') {
    //         setIngredients(prev => 
    //           prev.map(ing => ing.id === payload.new.id ? payload.new as Ingredient : ing)
    //         )
    //       } else if (payload.eventType === 'DELETE') {
    //         setIngredients(prev => prev.filter(ing => ing.id !== payload.old.id))
    //       }
    //     }
    //   )
    //   .subscribe()

    // return () => {
    //   supabase.removeChannel(channel)
    // }
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ingredient?')) return

    setDeleting(id)
    try {
      const response = await fetch(`/api/ingredients/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setIngredients(prev => prev.filter(ing => ing.id !== id))
      } else {
        const data = await response.json()
        alert(`Failed to delete: ${data.error}`)
      }
    } catch (error) {
      console.error('Error deleting ingredient:', error)
      alert('Failed to delete ingredient')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <IngredientsContext.Provider 
      value={{ 
        ingredients, 
        loadingIngredients, 
        deleting,
        handleDelete,
        refreshIngredients,
      }}
    >
      {children}
    </IngredientsContext.Provider>
  )
}