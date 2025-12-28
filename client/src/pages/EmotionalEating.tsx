import { useState } from "react";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Plus, TrendingDown, TrendingUp, Brain, Heart, Frown, Coffee, Flame, Users } from "lucide-react";
import { useLocation } from "wouter";

const emotionIcons = {
  stress: Flame,
  anxiety: Brain,
  sadness: Frown,
  boredom: Coffee,
  anger: Flame,
  loneliness: Users,
  other: Heart,
};

const emotionColors = {
  stress: "text-orange-500",
  anxiety: "text-purple-500",
  sadness: "text-blue-500",
  boredom: "text-gray-500",
  anger: "text-red-500",
  loneliness: "text-indigo-500",
  other: "text-pink-500",
};

export default function EmotionalEating() {
  const [, setLocation] = useLocation();

  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [triggerEmotion, setTriggerEmotion] = useState<string>("stress");
  const [triggerDescription, setTriggerDescription] = useState("");
  const [situation, setSituation] = useState("");
  const [foodConsumed, setFoodConsumed] = useState("");
  const [estimatedCalories, setEstimatedCalories] = useState("");
  const [intensity, setIntensity] = useState("5");
  const [copingStrategyUsed, setCopingStrategyUsed] = useState("");
  const [effectivenessRating, setEffectivenessRating] = useState("");
  const [notes, setNotes] = useState("");

  // Queries
  const { data: history, refetch: refetchHistory } = trpc.emotionalEating.getHistory.useQuery();
  const { data: analytics } = trpc.emotionalEating.getAnalytics.useQuery();

  // Mutations
  const logEpisode = trpc.emotionalEating.logEpisode.useMutation({
    onSuccess: () => {
      toast.success("Episode logged successfully");
      setDialogOpen(false);
      resetForm();
      refetchHistory();
    },
    onError: (error) => {
      toast.error("Error logging episode: " + error.message);
    },
  });

  const resetForm = () => {
    setTriggerEmotion("stress");
    setTriggerDescription("");
    setSituation("");
    setFoodConsumed("");
    setEstimatedCalories("");
    setIntensity("5");
    setCopingStrategyUsed("");
    setEffectivenessRating("");
    setNotes("");
  };

  const handleSubmit = () => {
    if (!foodConsumed.trim()) {
      toast.error("Please enter the food consumed");
      return;
    }

    logEpisode.mutate({
      triggerEmotion: triggerEmotion as any,
      triggerDescription: triggerDescription || undefined,
      situation: situation || undefined,
      foodConsumed,
      estimatedCalories: estimatedCalories ? parseInt(estimatedCalories) : undefined,
      intensity: parseInt(intensity),
      copingStrategyUsed: copingStrategyUsed || undefined,
      effectivenessRating: effectivenessRating ? parseInt(effectivenessRating) : undefined,
      notes: notes || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-6xl py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Emotional Eating Tracker</h1>
              <p className="text-muted-foreground">
                Track triggers, patterns, and coping strategies
              </p>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Log Episode
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Log Emotional Eating Episode</DialogTitle>
                <DialogDescription>
                  Record the details of this episode to identify patterns and track progress
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="emotion">Trigger Emotion *</Label>
                  <Select value={triggerEmotion} onValueChange={setTriggerEmotion}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stress">Stress</SelectItem>
                      <SelectItem value="anxiety">Anxiety</SelectItem>
                      <SelectItem value="sadness">Sadness</SelectItem>
                      <SelectItem value="boredom">Boredom</SelectItem>
                      <SelectItem value="anger">Anger</SelectItem>
                      <SelectItem value="loneliness">Loneliness</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="triggerDesc">What triggered this emotion?</Label>
                  <Textarea
                    id="triggerDesc"
                    placeholder="e.g., Work deadline, argument with friend, feeling overwhelmed..."
                    value={triggerDescription}
                    onChange={(e) => setTriggerDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="situation">Situation/Context</Label>
                  <Textarea
                    id="situation"
                    placeholder="Where were you? What were you doing?"
                    value={situation}
                    onChange={(e) => setSituation(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="food">Food Consumed *</Label>
                  <Input
                    id="food"
                    placeholder="e.g., Bag of chips, pint of ice cream, cookies..."
                    value={foodConsumed}
                    onChange={(e) => setFoodConsumed(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="calories">Estimated Calories (optional)</Label>
                  <Input
                    id="calories"
                    type="number"
                    placeholder="e.g., 500"
                    value={estimatedCalories}
                    onChange={(e) => setEstimatedCalories(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="intensity">Intensity (1-10) *</Label>
                  <Select value={intensity} onValueChange={setIntensity}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <SelectItem key={n} value={n.toString()}>
                          {n} - {n <= 3 ? "Mild" : n <= 6 ? "Moderate" : "Intense"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coping">Coping Strategy Used (if any)</Label>
                  <Input
                    id="coping"
                    placeholder="e.g., Deep breathing, went for a walk, called a friend..."
                    value={copingStrategyUsed}
                    onChange={(e) => setCopingStrategyUsed(e.target.value)}
                  />
                </div>

                {copingStrategyUsed && (
                  <div className="space-y-2">
                    <Label htmlFor="effectiveness">Effectiveness of Coping Strategy (1-10)</Label>
                    <Select value={effectivenessRating} onValueChange={setEffectivenessRating}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                          <SelectItem key={n} value={n.toString()}>
                            {n} - {n <= 3 ? "Not helpful" : n <= 6 ? "Somewhat helpful" : "Very helpful"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any other observations or thoughts..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={logEpisode.isPending}>
                  {logEpisode.isPending ? "Logging..." : "Log Episode"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Episodes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalEpisodes}</div>
                <p className="text-xs text-muted-foreground">Last {analytics.periodDays} days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Intensity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.avgIntensity}/10</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.avgIntensity > 7 ? "High" : analytics.avgIntensity > 4 ? "Moderate" : "Low"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Coping Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.copingUsageRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.episodesWithCoping} of {analytics.totalEpisodes} episodes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Coping Effectiveness</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.avgCopingEffectiveness}/10</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.avgCopingEffectiveness > 7 ? "Very helpful" : analytics.avgCopingEffectiveness > 4 ? "Somewhat helpful" : "Needs improvement"}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Emotion Breakdown */}
        {analytics && analytics.emotionCounts && Object.keys(analytics.emotionCounts).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Trigger Emotions</CardTitle>
              <CardDescription>Most common emotional triggers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.emotionCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([emotion, count]) => {
                    const Icon = emotionIcons[emotion as keyof typeof emotionIcons] || Heart;
                    const colorClass = emotionColors[emotion as keyof typeof emotionColors] || "text-gray-500";
                    const percentage = analytics.totalEpisodes > 0 ? Math.round((count / analytics.totalEpisodes) * 100) : 0;
                    
                    return (
                      <div key={emotion} className="flex items-center gap-4">
                        <Icon className={`h-5 w-5 ${colorClass}`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium capitalize">{emotion}</span>
                            <span className="text-sm text-muted-foreground">
                              {count} ({percentage}%)
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Episode History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Episodes</CardTitle>
            <CardDescription>Your emotional eating history</CardDescription>
          </CardHeader>
          <CardContent>
            {!history || history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No episodes logged yet.</p>
                <p className="text-sm mt-2">Start tracking to identify patterns and improve coping strategies.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((episode) => {
                  const Icon = emotionIcons[episode.triggerEmotion as keyof typeof emotionIcons] || Heart;
                  const colorClass = emotionColors[episode.triggerEmotion as keyof typeof emotionColors] || "text-gray-500";
                  
                  return (
                    <div key={episode.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-5 w-5 ${colorClass}`} />
                          <div>
                            <p className="font-medium capitalize">{episode.triggerEmotion}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(episode.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">Intensity: {episode.intensity}/10</p>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">Food:</span> {episode.foodConsumed}
                          {episode.estimatedCalories && (
                            <span className="text-muted-foreground"> (~{episode.estimatedCalories} cal)</span>
                          )}
                        </p>
                        
                        {episode.triggerDescription && (
                          <p className="text-sm">
                            <span className="font-medium">Trigger:</span> {episode.triggerDescription}
                          </p>
                        )}
                        
                        {episode.copingStrategyUsed && (
                          <p className="text-sm">
                            <span className="font-medium">Coping Strategy:</span> {episode.copingStrategyUsed}
                            {episode.effectivenessRating && (
                              <span className="text-muted-foreground"> (Effectiveness: {episode.effectivenessRating}/10)</span>
                            )}
                          </p>
                        )}
                        
                        {episode.notes && (
                          <p className="text-sm text-muted-foreground">{episode.notes}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
