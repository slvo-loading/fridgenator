'use client'

import { BookBookmarkIcon, GearIcon } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { FridgeItem, Ingredient } from '../lib/types'
import { useIngredients } from '../lib/IngredientContext'
import Select from 'react-select'
import FridgeDoor from '@/app/components/fridgeDoor'

export default function Dashboard() {
  const { user, signOut, loading, isAdmin } = useAuth()
  const { ingredients, loadingIngredients } = useIngredients()
  const router = useRouter()
  const [items, setItems] = useState<FridgeItem[]>([])
  const [loadingItems, setLoadingItems] = useState(true)
  const [newItem, setNewItem] = useState<FridgeItem>({
    item: null,
    expiration_date: null,
  })
  const [storage, setStorage] = useState<string | null>(null)


  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchItems()
    }
  }, [user])

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/fridge')
      const data = await response.json()
      setItems(data.items || [])
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setLoadingItems(false)
    }
  }

  const addItem = async () => {
    console.log("adding an item")
    if (!newItem || !newItem.item || !newItem.expiration_date) {
      alert('Please fill in all fields')
      return
    }

    try {
      console.log('calling api')
      const response = await fetch('/api/fridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      })

      if (!response.ok) throw new Error('Failed to add item')

      const data = await response.json()

      const updatedItems = [...items, data.item].sort((a, b) => 
        new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime()
      );
      setItems(updatedItems)
      
      setNewItem({
        item: null,
        expiration_date: null,
      })

      
    } catch (error) {
      console.error('Error adding item:', error)
      alert('Failed to add item')
    }
  }

  const deleteItem = async (id: string) => {
    try {
      const response = await fetch(`/api/fridge/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete item')

      setItems(items.filter((item) => item.id !== id))
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Failed to delete item')
    }
  }

  const getDaysUntilExpiry = (expiryDate: string | null) => {
    if (!expiryDate){
      return
    }
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const getExpiryStatus = (days: number | null) => {
    if (!days) {
      return
    }
    if (days < 0) return { label: 'Expired', color: 'bg-red-100 text-red-800 border-red-300' }
    if (days <= 2) return { label: `${days}d left`, color: 'bg-orange-100 text-orange-800 border-orange-300' }
    if (days <= 5) return { label: `${days}d left`, color: 'bg-yellow-100 text-yellow-800 border-yellow-300' }
    return { label: `${days}d left`, color: 'bg-green-100 text-green-800 border-green-300' }
  }

  if (loadingItems) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  const setExpireDay = (storage: string, days_to_expire: number) => {
    const today = new Date()

    setStorage(storage)
    const expirationDate = new Date(today)
    expirationDate.setDate(today.getDate() + days_to_expire)
    setNewItem(prev => ({ 
      ...prev, 
      expiration_date: expirationDate.toISOString().split('T')[0] // Format as YYYY-MM-DD
    }))

  }

  if (!user) return null

  return (
    <div className="min-h-screen p-4 bg-yellow-50">

      <div className="max-w-7xl mx-auto">
        <header className="flex justify-end items-center mb-8 pt-6">
          {isAdmin && 
            <div>
              <button 
              onClick={() => router.push('/admin')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                go to admin
              </button>

              <button 
              onClick={() => router.push('/recipe/form/new')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                go to recipe form
              </button>
            </div>}

          <button 
          onClick={() => router.push('/recipe')}
          className='text-yellow-900'
          >
            <BookBookmarkIcon size={28} weight="fill" />
          </button>

          <button
            onClick={signOut}
            className="text-yellow-900 pl-5"
          >
            <GearIcon size={28} weight="fill" />
          </button>
        </header>

        <div className="flex items-end justify-center gap-4 relative z-10 px-2 pb-2" style={{height: 'calc(100vh - 9rem)'}}>

          {/* fridge */}
          {/* <div className='w-1/3 flex-col border-2' style={{height: 'calc(100vh - 8rem)'}}>
            
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-3 text-gray-700">Add New Item</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">

                <Select
                  options={ingredientOptions}
                  placeholder="Select an ingredient..."
                  isSearchable
                  value={newItem?.item ? { 
                    value: newItem.item.id, 
                    label: newItem.item.ingredient,
                    data: newItem.item 
                  } : null}
                  onChange={(selectedOption) => {
                    if (selectedOption) {
                      const ingredient = selectedOption.data
                      setNewItem(prev => ({ ...prev, item: ingredient }))
                      
                      if (ingredient.pantry_expire) {
                        setExpireDay('pantry', ingredient.pantry_expire)
                      } else if (ingredient.fridge_expire) {
                        setExpireDay('fridge', ingredient.fridge_expire)
                      } else if (ingredient.freezer_expire) {
                        setExpireDay('freezer', ingredient.freezer_expire)
                      }

                    }
                  }}
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: '#d1d5db',
                      '&:hover': { borderColor: '#6366f1' },
                      '&:focus': { borderColor: '#6366f1', boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.2)' }
                    })
                  }}
                />
                
                {newItem.item?.pantry_expire &&
                <button
                onClick={() => setExpireDay('pantry', newItem.item?.pantry_expire || 0)}
                className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  storage === 'pantry' 
                    ? 'bg-indigo-600 text-white border-indigo-600 focus:ring-indigo-500' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-indigo-500'
                }`}
                >Pantry</button>}

                {newItem.item?.fridge_expire &&
                <button
                onClick={() => setExpireDay('fridge', newItem.item?.fridge_expire || 0)}
                className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  storage === 'fridge' 
                    ? 'bg-indigo-600 text-white border-indigo-600 focus:ring-indigo-500' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-indigo-500'
                }`}
                >Fridge</button>}

                {newItem.item?.freezer_expire &&
                <button
                onClick={() => setExpireDay('freezer', newItem.item?.freezer_expire || 0)}
                className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  storage === 'freezer' 
                    ? 'bg-indigo-600 text-white border-indigo-600 focus:ring-indigo-500' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-indigo-500'
                }`}
                >Freezer</button>}

              </div>
              <button
                onClick={addItem}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 transition-colors"
              >
                Enter
              </button>
            </div>

            
            <div className="space-y-2">
              {items.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No items in your fridge yet. Add some!</p>
              ) : (
                items.map((item) => {
                  console.log('items:', items)
                  const days = getDaysUntilExpiry(item.expiration_date) || null
                  const status = getExpiryStatus(days)
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-800 text-lg">{item.item?.ingredient}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-3 py-1 rounded-full border font-medium ${status?.color}`}>
                          {status?.label}
                        </span>
                        {item.id &&
                        <button
                          onClick={() => deleteItem(item.id ?? '')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                        </button>
                        }
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div> 
          */}
          <FridgeDoor className='w-1/3' style={{height: 'calc(100vh - 11rem)'}}/>
          {/* style={{height: 'calc(100vh - 11rem)'}} */}


          {/* chat */}
          <div className='flex-1 border-2 h-full'>
          {/* style={{height: 'calc(100vh - 8rem)'}} */}

          </div>

        </div>

        <div className="fixed bottom-0 left-0 right-0 h-35 bg-yellow-900"></div>
      </div>
    </div>
  )
}
