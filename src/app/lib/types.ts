export interface FridgeItem {
    id: string
    user_id: string
    ingredient_id: string
    item: Ingredient
    amount: number
    measurement: string
    expiration_date: string
    created_at: string
  }
  
export type NewFridgeItem = {
  item: Ingredient | null
  amount: number | null
  measurement: string | null
  expiration_date: string | null
}

export interface Ingredient {
  id: string
  ingredient: string
  description: string | null
  embedding: number[]
  pantry_expire: number | null
  fridge_expire: number | null
  freezer_expire: number | null
}