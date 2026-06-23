export interface NutritionData {
  id?: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  source: string;
}

export interface MealLog {
  id: string;
  profileId: string;
  name: string;
  weightG: number;
  calories: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  isCarnivorePure: boolean;
  nutritionDataId?: string;
  createdAt: string;
}
