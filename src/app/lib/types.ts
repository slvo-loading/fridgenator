export interface FridgeItem {
    id?: string
    item: Ingredient | null
    expiration_date: string | null
}

export interface Ingredient {
  id: string
  ingredient: string
  description: string | null
  pantry_expire?: number
  fridge_expire?: number
  freezer_expire?: number
  unit_family: 'volume' | 'weight' | 'count',
  cups_per_lb: string
}

export interface RecipeIngredient {
  ingredient: Ingredient | null,
  amount: string,
  measurment: string
}

export interface RecipeInstructions {
  id: number
  order: number
  action: string
  timer_hrs: string,
  timer_mins: string,
  timer_secs: string,
  text: string
}

export interface Recipe {
  id: string;
  user_id: string
  name: string;
  tags: string[];
  prep_time_mins: number;
  cook_time_mins: number;
  servings: number;
  difficulty: string;
  created_at: string;
  is_public: boolean;
  ingredients: RecipeIngredient[];
  instructions: RecipeInstructions[];
  is_saved: [{id: number}],
}
