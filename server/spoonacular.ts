/**
 * Spoonacular Food API integration
 * Docs: https://spoonacular.com/food-api/docs
 */

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const BASE_URL = "https://api.spoonacular.com";

export interface IngredientSearchResult {
  id: number;
  name: string;
  image: string;
}

export interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface IngredientNutrition {
  id: number;
  name: string;
  amount: number;
  unit: string;
  nutrition: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
  };
}

/**
 * Search for ingredients by name
 * Endpoint: GET /food/ingredients/search
 */
export async function searchIngredients(query: string, number: number = 10): Promise<IngredientSearchResult[]> {
  if (!SPOONACULAR_API_KEY) {
    throw new Error("SPOONACULAR_API_KEY is not configured");
  }

  const url = new URL(`${BASE_URL}/food/ingredients/search`);
  url.searchParams.append("apiKey", SPOONACULAR_API_KEY);
  url.searchParams.append("query", query);
  url.searchParams.append("number", number.toString());
  url.searchParams.append("metaInformation", "true");

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`Spoonacular API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.results || [];
}

/**
 * Get nutrition information for an ingredient
 * Endpoint: GET /food/ingredients/{id}/information
 */
export async function getIngredientNutrition(
  ingredientId: number,
  amount: number = 100,
  unit: string = "g"
): Promise<NutritionData> {
  if (!SPOONACULAR_API_KEY) {
    throw new Error("SPOONACULAR_API_KEY is not configured");
  }

  const url = new URL(`${BASE_URL}/food/ingredients/${ingredientId}/information`);
  url.searchParams.append("apiKey", SPOONACULAR_API_KEY);
  url.searchParams.append("amount", amount.toString());
  url.searchParams.append("unit", unit);

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`Spoonacular API error: ${response.status} ${response.statusText}`);
  }

  const data: IngredientNutrition = await response.json();

  // Extract nutrition data from the response
  const nutrients = data.nutrition.nutrients;
  
  const getNutrient = (name: string): number => {
    const nutrient = nutrients.find(n => n.name === name);
    return nutrient ? Math.round(nutrient.amount) : 0;
  };

  return {
    calories: getNutrient("Calories"),
    protein: getNutrient("Protein"),
    carbs: getNutrient("Carbohydrates"),
    fat: getNutrient("Fat"),
    fiber: getNutrient("Fiber"),
  };
}

/**
 * Autocomplete ingredient search (faster, returns simple list)
 * Endpoint: GET /food/ingredients/autocomplete
 */
export async function autocompleteIngredients(query: string, number: number = 10): Promise<IngredientSearchResult[]> {
  if (!SPOONACULAR_API_KEY) {
    throw new Error("SPOONACULAR_API_KEY is not configured");
  }

  const url = new URL(`${BASE_URL}/food/ingredients/autocomplete`);
  url.searchParams.append("apiKey", SPOONACULAR_API_KEY);
  url.searchParams.append("query", query);
  url.searchParams.append("number", number.toString());
  url.searchParams.append("metaInformation", "true");

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`Spoonacular API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}
