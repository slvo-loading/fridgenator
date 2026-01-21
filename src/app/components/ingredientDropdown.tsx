'use client'
import Select from 'react-select'
import { useIngredients } from '../lib/IngredientContext'

export default function IngredientDropdown() {
    const { ingredients, loadingIngredients } = useIngredients()

    const ingredientOptions = ingredients.map(ingredient => ({
        value: ingredient.id,
        label: ingredient.ingredient,
        data: ingredient
    }))

    
}