export interface FridgeItem {
    id: string
    user_id: string
    name: string
    amount: number
    measurement: string
    expiration_date: string
    created_at: string
  }
  
  export type NewFridgeItem = {
    name: string
    amount: number
    measurement: string
    expiration_date: string
  }