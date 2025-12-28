import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Apple, Plus, AlertTriangle, ArrowLeft, Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function Meals() {
  const [, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    mealType: "breakfast" as "breakfast" | "lunch" | "dinner" | "snack",
    description: "",
    containsSoybeanOil: false,
    containsCornOil: false,
    containsSunflowerOil: false,
    highLinoleicAcid: false,
    isProcessedFood: false,
    fiberContent: "moderate" as "none" | "low" | "moderate" | "high",
    notes: "",
  });

  const utils = trpc.useUtils();
  const { data: meals, isLoading } = trpc.meals.list.useQuery({});
  
  const createMeal = trpc.meals.create.useMutation({
    onSuccess: () => {
      toast.success("Meal logged successfully!");
      utils.meals.list.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to log meal: " + error.message);
    },
  });

  const deleteMeal = trpc.meals.delete.useMutation({
    onSuccess: () => {
      toast.success("Meal deleted");
      utils.meals.list.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to delete meal: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      mealType: "breakfast",
      description: "",
      containsSoybeanOil: false,
      containsCornOil: false,
      containsSunflowerOil: false,
      highLinoleicAcid: false,
      isProcessedFood: false,
      fiberContent: "moderate",
      notes: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMeal.mutate({
      loggedAt: new Date(),
      ...formData,
    });
  };

  const hasWarnings = (meal: any) => {
    return meal.containsSoybeanOil || meal.containsCornOil || meal.containsSunflowerOil || 
           meal.highLinoleicAcid || meal.isProcessedFood;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      <div className="container py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Apple className="h-8 w-8 text-green-600" />
              Dietary Tracking
            </h1>
            <p className="text-muted-foreground">Log your meals and analyze nutritional content</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Log Meal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Log a Meal</DialogTitle>
                <DialogDescription>
                  Record what you ate and we'll analyze it for problematic oils and processed ingredients
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mealType">Meal Type</Label>
                  <Select
                    value={formData.mealType}
                    onValueChange={(value) => setFormData({ ...formData, mealType: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                      <SelectItem value="snack">Snack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">What did you eat?</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g., Grilled chicken salad with olive oil dressing, brown rice..."
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <Label className="text-base">Oil & Fat Analysis</Label>
                  <div className="space-y-2 pl-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="containsSoybeanOil"
                        checked={formData.containsSoybeanOil}
                        onCheckedChange={(checked) => setFormData({ ...formData, containsSoybeanOil: checked as boolean })}
                      />
                      <Label htmlFor="containsSoybeanOil" className="font-normal cursor-pointer">
                        Contains soybean oil ⚠️
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="containsCornOil"
                        checked={formData.containsCornOil}
                        onCheckedChange={(checked) => setFormData({ ...formData, containsCornOil: checked as boolean })}
                      />
                      <Label htmlFor="containsCornOil" className="font-normal cursor-pointer">
                        Contains corn oil ⚠️
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="containsSunflowerOil"
                        checked={formData.containsSunflowerOil}
                        onCheckedChange={(checked) => setFormData({ ...formData, containsSunflowerOil: checked as boolean })}
                      />
                      <Label htmlFor="containsSunflowerOil" className="font-normal cursor-pointer">
                        Contains sunflower oil ⚠️
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="highLinoleicAcid"
                        checked={formData.highLinoleicAcid}
                        onCheckedChange={(checked) => setFormData({ ...formData, highLinoleicAcid: checked as boolean })}
                      />
                      <Label htmlFor="highLinoleicAcid" className="font-normal cursor-pointer">
                        High in linoleic acid ⚠️
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <Label className="text-base">Nutritional Flags</Label>
                  <div className="space-y-2 pl-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isProcessedFood"
                        checked={formData.isProcessedFood}
                        onCheckedChange={(checked) => setFormData({ ...formData, isProcessedFood: checked as boolean })}
                      />
                      <Label htmlFor="isProcessedFood" className="font-normal cursor-pointer">
                        Processed/ultra-processed food
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fiberContent">Fiber Content</Label>
                  <Select
                    value={formData.fiberContent}
                    onValueChange={(value) => setFormData({ ...formData, fiberContent: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any additional notes about this meal..."
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMeal.isPending}>
                    {createMeal.isPending ? "Logging..." : "Log Meal"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Info Card */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">Why Track Oils?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>
              Research from UC Riverside (2025) shows that oils high in linoleic acid (soybean, corn, sunflower) 
              are converted into inflammatory oxylipins in the liver, directly contributing to weight gain.
            </p>
            <p className="font-medium text-blue-900">
              Better alternatives: Olive oil, avocado oil, coconut oil
            </p>
          </CardContent>
        </Card>

        {/* Meals List */}
        <div className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Loading meals...
              </CardContent>
            </Card>
          ) : meals && meals.length > 0 ? (
            meals.map((meal) => (
              <Card key={meal.id} className={hasWarnings(meal) ? "border-orange-300" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg capitalize flex items-center gap-2">
                        {meal.mealType}
                        {hasWarnings(meal) && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                      </CardTitle>
                      <CardDescription>
                        {format(new Date(meal.loggedAt), "MMM d, yyyy 'at' h:mm a")}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMeal.mutate({ id: meal.id })}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">{meal.description}</p>
                  
                  {hasWarnings(meal) && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 space-y-1">
                      <p className="text-sm font-medium text-orange-900">⚠️ Nutritional Warnings:</p>
                      <ul className="text-sm text-orange-800 space-y-1 ml-4 list-disc">
                        {meal.containsSoybeanOil && <li>Contains soybean oil (high linoleic acid)</li>}
                        {meal.containsCornOil && <li>Contains corn oil (high linoleic acid)</li>}
                        {meal.containsSunflowerOil && <li>Contains sunflower oil (high linoleic acid)</li>}
                        {meal.highLinoleicAcid && <li>High in linoleic acid</li>}
                        {meal.isProcessedFood && <li>Processed/ultra-processed food</li>}
                      </ul>
                    </div>
                  )}
                  
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-xs px-2 py-1 bg-muted rounded-full">
                      Fiber: {meal.fiberContent}
                    </span>
                  </div>
                  
                  {meal.notes && (
                    <p className="text-sm text-muted-foreground italic">Note: {meal.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Apple className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No meals logged yet</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Log Your First Meal
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
