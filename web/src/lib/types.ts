export interface Ingredient {
  name: string;
  measure: string;
}

export interface Recipe {
  id: string;
  title: string;
  category: string;
  area: string;
  image: string;
  instructions: string[];
  ingredients: Ingredient[];
  tags: string[];
  youtube?: string;
  source?: string;
  servings?: number;
  cookTime?: number;
  origin: 'api' | 'user';
  createdAt?: number;
  updatedAt?: number;
}

export type RecipeSummary = Pick<Recipe, 'id' | 'title' | 'image' | 'category' | 'area' | 'origin'> & {
  tags?: string[];
};

export type MealSlot = 'breakfast' | 'lunch' | 'dinner';

export interface PlannedMeal {
  recipeId: string;
  title: string;
  image: string;
  origin: Recipe['origin'];
  addedAt: number;
}

export type WeekPlan = Record<string, Partial<Record<MealSlot, PlannedMeal>>>;
