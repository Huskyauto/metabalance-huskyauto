import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Trash2, ChevronLeft, ChevronRight, Calendar as CalendarIcon, ArrowLeft, BarChart3, Copy } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export default function Meals() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>("breakfast");
  const utils = trpc.useUtils();

  // Form state
  const [formData, setFormData] = useState({
    foodName: "",
    servingSize: "",
    quantity: "1",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
    fiber: "",
    notes: "",
  });

  // Food search state
  const [foodSearchQuery, setFoodSearchQuery] = useState("");
  const [selectedFoodId, setSelectedFoodId] = useState<number | null>(null);
  const [showFoodResults, setShowFoodResults] = useState(false);

  // Food search query
  const { data: foodResults = [] } = trpc.food.search.useQuery(
    { query: foodSearchQuery, limit: 10 },
    {
      enabled: foodSearchQuery.length >= 2,
      staleTime: 60000, // Cache for 1 minute
    }
  );

  // Get nutrition data when food is selected
  const { data: nutritionData, isLoading: isLoadingNutrition } = trpc.food.getNutrition.useQuery(
    { ingredientId: selectedFoodId!, amount: 100, unit: "g" },
    {
      enabled: selectedFoodId !== null,
    }
  );

  // Auto-fill nutrition fields when data is loaded
  useEffect(() => {
    if (nutritionData) {
      setFormData(prev => ({
        ...prev,
        calories: nutritionData.calories.toString(),
        protein: nutritionData.protein.toString(),
        carbs: nutritionData.carbs.toString(),
        fats: nutritionData.fat.toString(),
        fiber: nutritionData.fiber.toString(),
        servingSize: "100g",
      }));
      toast.success("Nutrition data loaded!");
    }
  }, [nutritionData]);

  // Queries
  const { data: meals = [], isLoading } = trpc.meals.getByDate.useQuery(
    { date: selectedDate },
    {
      refetchOnMount: 'always',
      staleTime: 0,
    }
  );

  const { data: dailyTotals } = trpc.meals.getDailyTotals.useQuery(
    { date: selectedDate },
    {
      refetchOnMount: 'always',
      staleTime: 0,
    }
  );

  const { data: nutritionGoals } = trpc.profile.getNutritionGoals.useQuery(
    undefined,
    {
      refetchOnMount: 'always',
      staleTime: 0,
    }
  );

  // Mutations
  const checkAchievements = trpc.achievements.checkUnlocks.useMutation();
  
  const createMeal = trpc.meals.create.useMutation({
    onSuccess: () => {
      utils.meals.getByDate.invalidate();
      utils.meals.getDailyTotals.invalidate();
      setIsAddDialogOpen(false);
      resetForm();
      // Check for newly unlocked achievements (e.g., first meal logged)
      checkAchievements.mutate();
      toast.success("Meal added successfully!");
    },
    onError: (error) => {
      toast.error("Error: " + error.message);
    },
  });

  const deleteMeal = trpc.meals.delete.useMutation({
    onSuccess: () => {
      utils.meals.getByDate.invalidate();
      utils.meals.getDailyTotals.invalidate();
      toast.success("Meal deleted");
    },
  });

  const resetForm = () => {
    setFormData({
      foodName: "",
      servingSize: "",
      quantity: "1",
      calories: "",
      protein: "",
      carbs: "",
      fats: "",
      fiber: "",
      notes: "",
    });
    setFoodSearchQuery("");
    setSelectedFoodId(null);
    setShowFoodResults(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.foodName.trim()) {
      toast.error("Please enter a food name");
      return;
    }

    const quantity = parseInt(formData.quantity) || 1;
    
    createMeal.mutate({
      loggedAt: new Date(selectedDate),
      mealType: selectedMealType,
      foodName: formData.foodName,
      servingSize: formData.servingSize || undefined,
      calories: formData.calories ? parseInt(formData.calories) * quantity : undefined,
      protein: formData.protein ? parseInt(formData.protein) * quantity : undefined,
      carbs: formData.carbs ? parseInt(formData.carbs) * quantity : undefined,
      fats: formData.fats ? parseInt(formData.fats) * quantity : undefined,
      fiber: formData.fiber ? parseInt(formData.fiber) * quantity : undefined,
      notes: formData.notes || undefined,
    });
  };

  const openAddDialog = (mealType: MealType) => {
    setSelectedMealType(mealType);
    setIsAddDialogOpen(true);
  };

  const duplicateMeal = (meal: any, mealType: MealType) => {
    setSelectedMealType(mealType);
    setFormData({
      foodName: meal.foodName,
      servingSize: meal.servingSize || "",
      quantity: "1",
      calories: meal.calories?.toString() || "",
      protein: meal.protein?.toString() || "",
      carbs: meal.carbs?.toString() || "",
      fats: meal.fats?.toString() || "",
      fiber: meal.fiber?.toString() || "",
      notes: meal.notes || "",
    });
    setIsAddDialogOpen(true);
  };

  // Group meals by type
  const mealsByType = {
    breakfast: meals.filter(m => m.mealType === "breakfast"),
    lunch: meals.filter(m => m.mealType === "lunch"),
    dinner: meals.filter(m => m.mealType === "dinner"),
    snack: meals.filter(m => m.mealType === "snack"),
  };

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const MealSection = ({ title, mealType, sectionMeals }: { title: string; mealType: MealType; sectionMeals: typeof meals }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Button size="sm" onClick={() => openAddDialog(mealType)}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {sectionMeals.length === 0 ? (
        <p className="text-sm text-muted-foreground">No meals logged yet</p>
      ) : (
        <div className="space-y-3">
          {sectionMeals.map((meal) => (
            <div key={meal.id} className="flex items-start justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium">{meal.foodName}</p>
                {meal.servingSize && (
                  <p className="text-sm text-muted-foreground">{meal.servingSize}</p>
                )}
                <div className="flex gap-4 mt-2 text-sm">
                  {meal.calories !== null && <span>{meal.calories} cal</span>}
                  {meal.protein !== null && <span>{meal.protein}g protein</span>}
                  {meal.carbs !== null && <span>{meal.carbs}g carbs</span>}
                  {meal.fats !== null && <span>{meal.fats}g fat</span>}
                  {meal.fiber !== null && <span>{meal.fiber}g fiber</span>}
                </div>
                {meal.notes && (
                  <p className="text-sm text-muted-foreground mt-2">{meal.notes}</p>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => duplicateMeal(meal, mealType)}
                  title="Log again"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteMeal.mutate({ id: meal.id })}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/'}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/nutrition-analytics'}>
          <BarChart3 className="h-4 w-4 mr-2" />
          Weekly Analytics
        </Button>
      </div>
      
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2">Dietary Tracking</h1>
        <p className="text-muted-foreground">
          Track your daily meals and monitor your nutrition
        </p>
      </div>
    </div>

      {/* Date Navigation */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" onClick={goToPreviousDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {format(selectedDate, "MMMM d, yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Button variant="outline" onClick={goToToday}>
              Today
            </Button>
          </div>

          <Button variant="outline" size="icon" onClick={goToNextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Daily Nutrition Totals with Goals */}
      {dailyTotals && nutritionGoals && (
        <Card className="p-6 mb-6 bg-primary/5">
          <h3 className="text-lg font-semibold mb-4">Daily Totals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Calories */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <p className="text-2xl font-bold">{dailyTotals.calories}</p>
                <p className="text-sm text-muted-foreground">/ {nutritionGoals.dailyCalories}</p>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Calories</p>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    (dailyTotals.calories / nutritionGoals.dailyCalories) > 1 
                      ? 'bg-red-500' 
                      : (dailyTotals.calories / nutritionGoals.dailyCalories) > 0.9 
                      ? 'bg-yellow-500' 
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((dailyTotals.calories / nutritionGoals.dailyCalories) * 100, 100)}%` }}
                />
              </div>
            </div>
            
            {/* Protein */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <p className="text-2xl font-bold">{dailyTotals.protein}g</p>
                <p className="text-sm text-muted-foreground">/ {nutritionGoals.dailyProtein}g</p>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Protein</p>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    (dailyTotals.protein / nutritionGoals.dailyProtein) > 1 
                      ? 'bg-red-500' 
                      : (dailyTotals.protein / nutritionGoals.dailyProtein) > 0.9 
                      ? 'bg-yellow-500' 
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((dailyTotals.protein / nutritionGoals.dailyProtein) * 100, 100)}%` }}
                />
              </div>
            </div>
            
            {/* Carbs */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <p className="text-2xl font-bold">{dailyTotals.carbs}g</p>
                <p className="text-sm text-muted-foreground">/ {nutritionGoals.dailyCarbs}g</p>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Carbs</p>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    (dailyTotals.carbs / nutritionGoals.dailyCarbs) > 1 
                      ? 'bg-red-500' 
                      : (dailyTotals.carbs / nutritionGoals.dailyCarbs) > 0.9 
                      ? 'bg-yellow-500' 
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((dailyTotals.carbs / nutritionGoals.dailyCarbs) * 100, 100)}%` }}
                />
              </div>
            </div>
            
            {/* Fats */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <p className="text-2xl font-bold">{dailyTotals.fats}g</p>
                <p className="text-sm text-muted-foreground">/ {nutritionGoals.dailyFats}g</p>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Fats</p>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    (dailyTotals.fats / nutritionGoals.dailyFats) > 1 
                      ? 'bg-red-500' 
                      : (dailyTotals.fats / nutritionGoals.dailyFats) > 0.9 
                      ? 'bg-yellow-500' 
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((dailyTotals.fats / nutritionGoals.dailyFats) * 100, 100)}%` }}
                />
              </div>
            </div>
            
            {/* Fiber */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <p className="text-2xl font-bold">{dailyTotals.fiber}g</p>
                <p className="text-sm text-muted-foreground">/ {nutritionGoals.dailyFiber}g</p>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Fiber</p>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    (dailyTotals.fiber / nutritionGoals.dailyFiber) > 1 
                      ? 'bg-red-500' 
                      : (dailyTotals.fiber / nutritionGoals.dailyFiber) > 0.9 
                      ? 'bg-yellow-500' 
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((dailyTotals.fiber / nutritionGoals.dailyFiber) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Meal Sections */}
      {isLoading ? (
        <div className="text-center py-8">Loading meals...</div>
      ) : (
        <div className="space-y-6">
          <MealSection title="Breakfast" mealType="breakfast" sectionMeals={mealsByType.breakfast} />
          <MealSection title="Lunch" mealType="lunch" sectionMeals={mealsByType.lunch} />
          <MealSection title="Dinner" mealType="dinner" sectionMeals={mealsByType.dinner} />
          <MealSection title="Snacks" mealType="snack" sectionMeals={mealsByType.snack} />
        </div>
      )}

      {/* Add Meal Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Add {selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Label htmlFor="foodName">Food Name *</Label>
              <Input
                id="foodName"
                value={formData.foodName}
                onChange={(e) => {
                  setFormData({ ...formData, foodName: e.target.value });
                  setFoodSearchQuery(e.target.value);
                  setShowFoodResults(true);
                }}
                onFocus={() => setShowFoodResults(true)}
                placeholder="Search for food... (e.g., chicken breast)"
                required
              />
              
              {/* Food search results dropdown */}
              {showFoodResults && foodSearchQuery.length >= 2 && foodResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {foodResults.map((food) => (
                    <button
                      key={food.id}
                      type="button"
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                      onClick={() => {
                        setFormData({ ...formData, foodName: food.name });
                        setSelectedFoodId(food.id);
                        setShowFoodResults(false);
                      }}
                    >
                      {food.image && (
                        <img 
                          src={`https://spoonacular.com/cdn/ingredients_100x100/${food.image}`} 
                          alt={food.name}
                          className="w-8 h-8 object-cover rounded"
                        />
                      )}
                      <span>{food.name}</span>
                    </button>
                  ))}
                </div>
              )}
              
              {isLoadingNutrition && (
                <p className="text-sm text-gray-500 mt-1">Loading nutrition data...</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="servingSize">Serving Size</Label>
                <Input
                  id="servingSize"
                  value={formData.servingSize}
                  onChange={(e) => setFormData({ ...formData, servingSize: e.target.value })}
                  placeholder="e.g., 1 cup, 100g"
                />
              </div>
              
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Select
                  value={formData.quantity}
                  onValueChange={(value) => setFormData({ ...formData, quantity: value })}
                >
                  <SelectTrigger id="quantity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 serving</SelectItem>
                    <SelectItem value="2">2 servings</SelectItem>
                    <SelectItem value="3">3 servings</SelectItem>
                    <SelectItem value="4">4 servings</SelectItem>
                    <SelectItem value="5">5 servings</SelectItem>
                    <SelectItem value="6">6 servings</SelectItem>
                    <SelectItem value="7">7 servings</SelectItem>
                    <SelectItem value="8">8 servings</SelectItem>
                    <SelectItem value="9">9 servings</SelectItem>
                    <SelectItem value="10">10 servings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="calories">Calories</Label>
                <Input
                  id="calories"
                  type="number"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="protein">Protein (g)</Label>
                <Input
                  id="protein"
                  type="number"
                  value={formData.protein}
                  onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="carbs">Carbs (g)</Label>
                <Input
                  id="carbs"
                  type="number"
                  value={formData.carbs}
                  onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="fats">Fats (g)</Label>
                <Input
                  id="fats"
                  type="number"
                  value={formData.fats}
                  onChange={(e) => setFormData({ ...formData, fats: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="fiber">Fiber (g)</Label>
                <Input
                  id="fiber"
                  type="number"
                  value={formData.fiber}
                  onChange={(e) => setFormData({ ...formData, fiber: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={createMeal.isPending}>
                {createMeal.isPending ? "Adding..." : "Add Meal"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
