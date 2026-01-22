export interface FridgeItem {
    id?: string
    item: Ingredient | null
    amount: number | null
    measurement: string | null
    expiration_date: string | null
}

export interface Ingredient {
  id: string
  ingredient: string
  description: string | null
  pantry_expire?: number
  fridge_expire?: number
  freezer_expire?: number
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
