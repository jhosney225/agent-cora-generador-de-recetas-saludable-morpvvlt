
```javascript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

interface Recipe {
  name: string;
  ingredients: string[];
  instructions: string[];
  calories: number;
  servings: number;
  prepTime: number;
  cookTime: number;
  nutritionalInfo: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}

async function generateHealthyRecipe(
  dietaryPreferences: string,
  calorieTarget: number,
  servings: number
): Promise<Recipe> {
  const prompt = `Generate a healthy recipe with the following specifications:
- Dietary preferences: ${dietaryPreferences}
- Target calories per serving: ${calorieTarget}
- Number of servings: ${servings}

Respond in the following JSON format:
{
  "name": "Recipe Name",
  "ingredients": ["ingredient 1", "ingredient 2", ...],
  "instructions": ["step 1", "step 2", ...],
  "calories": total_calories,
  "servings": ${servings},
  "prepTime": minutes,
  "cookTime": minutes,
  "nutritionalInfo": {
    "protein": grams,
    "carbs": grams,
    "fat": grams,
    "fiber": grams
  }
}

Make sure the recipe is:
1. Healthy and nutritious
2. Easy to prepare
3. Uses fresh, whole ingredients
4. Provides the target calorie content
5. Includes detailed nutritional information

Return ONLY the JSON object, no additional text.`;

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";

  const recipe: Recipe = JSON.parse(responseText);
  return recipe;
}

async function generateMealPlan(
  dietaryPreferences: string,
  dailyCalories: number,
  days: number
): Promise<{ day: number; breakfast: Recipe; lunch: Recipe; dinner: Recipe }[]> {
  const caloriesPerMeal = Math.round(dailyCalories / 3);
  const mealPlan: {
    day: number;
    breakfast: Recipe;
    lunch: Recipe;
    dinner: Recipe;
  }[] = [];

  console.log(`\n🍽️  Generating ${days}-day meal plan...`);
  console.log(`📊 Daily target: ${dailyCalories} calories`);
  console.log(`🥘 Per meal target: ${caloriesPerMeal} calories\n`);

  for (let day = 1; day <= days; day++) {
    console.log(`Day ${day}:`);

    const breakfast = await generateHealthyRecipe(
      `${dietaryPreferences}, breakfast`,
      caloriesPerMeal,
      1
    );
    console.log(`  ✓ Breakfast: ${breakfast.name} (${breakfast.calories} cal)`);

    const lunch = await generateHealthyRecipe(
      `${dietaryPreferences}, lunch`,
      caloriesPerMeal,
      1
    );
    console.log(`  ✓ Lunch: ${lunch.name} (${lunch.calories} cal)`);

    const dinner = await generateHealthyRecipe(
      `${dietaryPreferences}, dinner`,
      caloriesPerMeal,
      1
    );
    console.log(`  ✓ Dinner: ${dinner.name} (${dinner.calories} cal)`);

    mealPlan.push({ day, breakfast, lunch, dinner });
  }

  return mealPlan;
}

function displayRecipe(recipe: Recipe): void {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`🍳 ${recipe.name}`);
  console.log(`${"=".repeat(60)}`);

  console.log(`\n📋 Basic Info:`);
  console.log(
    `  • Servings: ${recipe.servings} | Prep: ${recipe.prepTime} min | Cook: ${recipe.cookTime} min`
  );
  console.log(
    `  • Total Calories: ${recipe.calories} | Per Serving: ${Math.round(recipe.calories / recipe.servings)}`
  );

  console.log(`\n🥗 Ingredients:`);
  recipe.ingredients.forEach((ingredient) => {
    console.log(`  • ${ingredient}`);
  });

  console.log(`\n📝 Instructions:`);
  recipe.instructions.forEach((instruction, index) => {
    console.log(`  ${index + 1}. ${instruction}`);
  });

  console.log(`\n💪 Nutritional Info (per serving):`);
  const perServing = {
    protein: (recipe.nutritionalInfo.protein / recipe.servings).toFixed(1),
    carbs: (recipe.nutritionalInfo.carbs / recipe.servings).toFixed(1),
    fat: (recipe.nutritionalInfo.fat / recipe.servings).toFixed(1),
    fiber: (recipe.nutritionalInfo.fiber / recipe.servings).toFixed(1),
  };

  console.log(`  • Protein: ${perServing.protein}g`);
  console.log(`  • Carbs: ${perServing.carbs}g`);
  console.log(`  • Fat: ${perServing.fat}g`);
  console.log(`  • Fiber: ${perServing.fiber}g`);
  console.log(`${"=".repeat(60)}\n`);
}

async function main(): Promise<void> {
  console.log(
    "🥗 Healthy Recipe Generator with Calorie Counter 🥗".padStart(50)
  );