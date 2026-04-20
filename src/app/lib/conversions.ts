type MeasurementUnit =
  | 'tsp' | 'tbsp' | 'cups' | 'fl oz' | 'pints' | 'quarts'
  | 'oz' | 'lbs' | 'g' | 'kg'
  | 'whole' | 'pieces' | 'slices' | 'cloves'
  | 'pinch' | 'dash' | 'to taste' | 'as needed'

const VOLUME_TO_TSP: Record<string, number> = {
    'tsp':    1,
    'tbsp':   3,
    'fl oz':  6,
    'cups':   48,
    'pints':  96,
    'quarts': 192,
  }
   
  const WEIGHT_TO_G: Record<string, number> = {
    'g':   1,
    'oz':  28.3495,
    'lbs': 453.592,
    'kg':  1000,
  }

export function convertToUnit(
    amount: number,
    fromUnit: MeasurementUnit,
    toUnit: MeasurementUnit
  ): number | null {
    if (fromUnit === toUnit) return amount
   
    const isVolume = (u: string) => u in VOLUME_TO_TSP
    const isWeight = (u: string) => u in WEIGHT_TO_G
    const isCount  = (u: string) => ['whole', 'pieces', 'slices', 'cloves'].includes(u)
    const isLoose  = (u: string) => ['pinch', 'dash', 'to taste', 'as needed'].includes(u)
   
    // Loose units can't be converted
    if (isLoose(fromUnit) || isLoose(toUnit)) return null
   
    // Count units — treat whole/pieces/slices/cloves as interchangeable 1:1
    if (isCount(fromUnit) && isCount(toUnit)) return amount
   
    // Volume → Volume
    if (isVolume(fromUnit) && isVolume(toUnit)) {
      const inTsp = amount * VOLUME_TO_TSP[fromUnit]
      return inTsp / VOLUME_TO_TSP[toUnit]
    }
   
    // Weight → Weight
    if (isWeight(fromUnit) && isWeight(toUnit)) {
      const inGrams = amount * WEIGHT_TO_G[fromUnit]
      return inGrams / WEIGHT_TO_G[toUnit]
    }
   
    // Cross-family (volume ↔ weight) — caller must handle via cups_per_lb
    return null
  }

  export function convertForDeduction(
    recipeAmount: number,
    recipeUnit: MeasurementUnit,
    pantryUnit: MeasurementUnit,
    cupsPerLb: number | null
  ): number | null {
    // Try same-family conversion first
    const sameFamilyResult = convertToUnit(recipeAmount, recipeUnit, pantryUnit)
    if (sameFamilyResult !== null) return sameFamilyResult
   
    // Cross-family: needs cups_per_lb
    if (cupsPerLb === null) return null
   
    const isVolume = (u: string) => u in VOLUME_TO_TSP
    const isWeight = (u: string) => u in WEIGHT_TO_G
   
    // Volume recipe unit → Weight pantry unit (e.g. cups flour → lbs)
    if (isVolume(recipeUnit) && isWeight(pantryUnit)) {
      const recipeInCups = convertToUnit(recipeAmount, recipeUnit, 'cups')!
      const recipeInLbs  = recipeInCups / cupsPerLb
      return convertToUnit(recipeInLbs, 'lbs', pantryUnit)
    }
   
    // Weight recipe unit → Volume pantry unit (e.g. lbs flour → cups)
    if (isWeight(recipeUnit) && isVolume(pantryUnit)) {
      const recipeInLbs  = convertToUnit(recipeAmount, recipeUnit, 'lbs')!
      const recipeInCups = recipeInLbs * cupsPerLb
      return convertToUnit(recipeInCups, 'cups', pantryUnit)
    }
   
    return null
  }