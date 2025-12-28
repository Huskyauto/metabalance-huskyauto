import { describe, it, expect } from "vitest";
import { searchIngredients, getIngredientNutrition, autocompleteIngredients } from "./spoonacular";

describe("Spoonacular API Integration", () => {
  it("validates API key by searching for a common ingredient", async () => {
    const results = await searchIngredients("chicken", 5);
    
    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    
    // Check structure of first result
    const firstResult = results[0];
    expect(firstResult).toHaveProperty("id");
    expect(firstResult).toHaveProperty("name");
    expect(typeof firstResult.id).toBe("number");
    expect(typeof firstResult.name).toBe("string");
  });

  it("fetches nutrition data for an ingredient", async () => {
    // Search for chicken breast first
    const searchResults = await searchIngredients("chicken breast", 1);
    expect(searchResults.length).toBeGreaterThan(0);
    
    const ingredientId = searchResults[0].id;
    
    // Get nutrition for 100g
    const nutrition = await getIngredientNutrition(ingredientId, 100, "g");
    
    expect(nutrition).toBeDefined();
    expect(nutrition.calories).toBeGreaterThan(0);
    expect(nutrition.protein).toBeGreaterThan(0);
    expect(typeof nutrition.carbs).toBe("number");
    expect(typeof nutrition.fat).toBe("number");
    expect(typeof nutrition.fiber).toBe("number");
  });

  it("autocompletes ingredient search", async () => {
    const results = await autocompleteIngredients("bana", 5);
    
    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    
    // Should find banana
    const hasBanana = results.some(r => r.name.toLowerCase().includes("banana"));
    expect(hasBanana).toBe(true);
  });
});
