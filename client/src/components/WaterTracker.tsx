import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplet, Plus, Minus } from "lucide-react";
import { toast } from "sonner";

export function WaterTracker() {
  const utils = trpc.useUtils();
  const { data: waterData } = trpc.water.getToday.useQuery();
  const [glasses, setGlasses] = useState(waterData?.glassesConsumed || 0);

  const upsertWater = trpc.water.upsert.useMutation({
    onSuccess: () => {
      utils.water.getToday.invalidate();
      utils.dailyGoals.get.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to update water intake: " + error.message);
    },
  });

  const handleUpdate = (newGlasses: number) => {
    if (newGlasses < 0 || newGlasses > 20) return;
    setGlasses(newGlasses);
    upsertWater.mutate({
      date: new Date(),
      glassesConsumed: newGlasses,
    });
  };

  // Sync with server data
  if (waterData && glasses !== waterData.glassesConsumed) {
    setGlasses(waterData.glassesConsumed);
  }

  const goalMet = glasses >= 8;
  const progress = Math.min((glasses / 8) * 100, 100);

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplet className={`h-5 w-5 ${goalMet ? "text-blue-500" : "text-gray-400"}`} />
            <CardTitle className="text-lg">Water Intake</CardTitle>
          </div>
          <div className="text-2xl font-bold">
            {glasses}
            <span className="text-sm font-normal text-muted-foreground">/8</span>
          </div>
        </div>
        <CardDescription>
          {goalMet ? "Daily goal achieved! 🎉" : `${8 - glasses} more glass${8 - glasses !== 1 ? "es" : ""} to reach your goal`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`absolute top-0 left-0 h-full transition-all duration-300 ${
              goalMet ? "bg-blue-500" : "bg-blue-400"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Visual glasses */}
        <div className="grid grid-cols-8 gap-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`h-8 rounded-sm border-2 transition-all ${
                i < glasses
                  ? "bg-blue-100 border-blue-500"
                  : "bg-gray-50 border-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleUpdate(glasses - 1)}
            disabled={glasses === 0 || upsertWater.isPending}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => handleUpdate(glasses + 1)}
            disabled={glasses >= 20 || upsertWater.isPending}
            className="px-6"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Glass
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleUpdate(glasses + 1)}
            disabled={glasses >= 20 || upsertWater.isPending}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Each glass = 8 oz (240 ml)
        </p>
      </CardContent>
    </Card>
  );
}
