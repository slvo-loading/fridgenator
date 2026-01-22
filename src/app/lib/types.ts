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

export interface RecipeIngredient {
  ingredient: Ingredient | null,
  amount: number,
  measurment: string
}


export interface RecipeInstructions {
  id: number
  order: number
  action: string
  timer_duration: number,
  timer_unit: string,
  text: string
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

export interface Recipe {
  id: string;
  name: string;
  tags: string[];
  prep_time_mins: number;
  cook_time_mins: number;
  servings: number;
  difficulty: string;
  created_at: string;
  is_public: boolean;
  ingredients?: RecipeIngredient[];
  instructions?: RecipeInstructions[]
}
