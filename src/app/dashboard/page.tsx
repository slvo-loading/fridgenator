'use client'

import { Calendar, ChefHat, Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { FridgeItem, NewFridgeItem, Ingredient } from '../lib/types'
import { useIngredients } from '../lib/IngredientContext'
import Select from 'react-select'

export default function Dashboard() {
  const { user, signOut, loading, isAdmin } = useAuth()
  const { ingredients, loadingIngredients } = useIngredients()
  const router = useRouter()
  const [items, setItems] = useState<FridgeItem[]>([])
  const [loadingItems, setLoadingItems] = useState(true)
  const [newItem, setNewItem] = useState<NewFridgeItem>({
    item: null,
    amount: null,
    measurement: null,
    expiration_date: null,
  })
  const [storage, setStorage] = useState<string | null>(null)

  const ingredientOptions = ingredients.map(ingredient => ({
    value: ingredient.id,
    label: ingredient.ingredient,
    data: ingredient
  }))

  useEffect(() => {
    console.log('newItem changed', newItem)
  }, [newItem])

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
    if (!newItem || !newItem.item || !newItem.amount || !newItem.measurement || !newItem.expiration_date) {
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
        amount: null,
        measurement: null,
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

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const getExpiryStatus = (days: number) => {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8 pt-6">
          <div className="flex items-center gap-3">
            <ChefHat className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">Fridgenator</h1>
          </div>
          {isAdmin && 
          <button 
          onClick={() => router.push('/admin')}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            go to admin
          </button>}
          <button
            onClick={signOut}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Sign Out
          </button>
        </header>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600" />
            Fridge Inventory
          </h2>

          {/* Add Item Form */}
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
              <input
                type="number"
                placeholder="Amount"
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={newItem?.amount || ''}
                onChange={(e) => setNewItem({ ...newItem, amount: Number(e.target.value) })}
              />
              <select
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={newItem?.measurement || 1}
                onChange={(e) => setNewItem({ ...newItem, measurement: e.target.value })}
              >
                <option value="">Select unit</option>
                <option value="count">count</option>
                <option value="whole">whole</option>
                <option value="pieces">pieces</option>
                <option value="cups">cups</option>
                <option value="tbsp">tbsp</option>
                <option value="tsp">tsp</option>
                <option value="oz">oz</option>
                <option value="lbs">lbs</option>
                <option value="g">g</option>
                <option value="kg">kg</option>
              </select>
              <input
                type="date"
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={newItem?.expiration_date || new Date().toISOString().split('T')[0]}
                onChange={(e) => setNewItem({ ...newItem, expiration_date: e.target.value })}
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
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          {/* Items List */}
          <div className="space-y-2">
            {items.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No items in your fridge yet. Add some!</p>
            ) : (
              items.map((item) => {
                console.log('items:', items)
                const days = getDaysUntilExpiry(item.expiration_date)
                const status = getExpiryStatus(days)
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-800 text-lg">{item.item.ingredient}</div>
                      <div className="text-sm text-gray-600">
                        {item.amount} {item.measurement}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-3 py-1 rounded-full border font-medium ${status.color}`}>
                        {status.label}
                      </span>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
