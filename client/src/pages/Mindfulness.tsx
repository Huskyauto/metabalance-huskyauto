import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  Wind, 
  Waves, 
  Utensils, 
  ScanLine, 
  Brain, 
  Anchor,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  Flame,
  Star,
  Trophy
} from "lucide-react";

// Category icons mapping
const categoryIcons: Record<string, React.ReactNode> = {
  breathing: <Wind className="h-5 w-5" />,
  urge_surfing: <Waves className="h-5 w-5" />,
  mindful_eating: <Utensils className="h-5 w-5" />,
  body_scan: <ScanLine className="h-5 w-5" />,
  meditation: <Brain className="h-5 w-5" />,
  grounding: <Anchor className="h-5 w-5" />,
};

const categoryLabels: Record<string, string> = {
  breathing: "Breathing",
  urge_surfing: "Urge Surfing",
  mindful_eating: "Mindful Eating",
  body_scan: "Body Scan",
  meditation: "Meditation",
  grounding: "Grounding",
};

const categoryColors: Record<string, string> = {
  breathing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  urge_surfing: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  mindful_eating: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  body_scan: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  meditation: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  grounding: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
};

export default function Mindfulness() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("library");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [moodBefore, setMoodBefore] = useState<string>("");
  const [moodAfter, setMoodAfter] = useState<string>("");
  const [cravingBefore, setCravingBefore] = useState<number>(5);
  const [cravingAfter, setCravingAfter] = useState<number>(5);
  const [trigger, setTrigger] = useState<string>("");
  const [notes, setNotes] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Queries
  const exercisesQuery = trpc.mindfulness.getExercises.useQuery();
  const statsQuery = trpc.mindfulness.getStats.useQuery();
  const recentSessionsQuery = trpc.mindfulness.getRecentSessions.useQuery({ limit: 5 });
  
  // Mutations
  const seedMutation = trpc.mindfulness.seedExercises.useMutation({
    onSuccess: () => {
      exercisesQuery.refetch();
    },
  });
  
  const startSessionMutation = trpc.mindfulness.startSession.useMutation({
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      setIsSessionActive(true);
      setElapsedTime(0);
    },
  });
  
  const completeSessionMutation = trpc.mindfulness.completeSession.useMutation({
    onSuccess: () => {
      setIsSessionActive(false);
      setSessionId(null);
      setSelectedExercise(null);
      setElapsedTime(0);
      setMoodBefore("");
      setMoodAfter("");
      setCravingBefore(5);
      setCravingAfter(5);
      setTrigger("");
      setNotes("");
      statsQuery.refetch();
      recentSessionsQuery.refetch();
    },
  });

  // Timer effect
  useEffect(() => {
    if (isSessionActive && !isPaused) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSessionActive, isPaused]);

  // Seed exercises if none exist
  useEffect(() => {
    if (exercisesQuery.data && exercisesQuery.data.length === 0) {
      seedMutation.mutate();
    }
  }, [exercisesQuery.data]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartSession = () => {
    if (!selectedExercise) return;
    
    startSessionMutation.mutate({
      exerciseId: selectedExercise.id,
      trigger: trigger as any || undefined,
      moodBefore: moodBefore as any || undefined,
      cravingIntensityBefore: cravingBefore,
    });
  };

  const handleCompleteSession = () => {
    if (!sessionId) return;
    
    completeSessionMutation.mutate({
      sessionId,
      durationMinutes: Math.ceil(elapsedTime / 60),
      moodAfter: moodAfter as any || undefined,
      cravingIntensityAfter: cravingAfter,
      notes: notes || undefined,
    });
  };

  const filteredExercises = exercisesQuery.data?.filter(
    (ex) => selectedCategory === "all" || ex.category === selectedCategory
  ) || [];

  const stats = statsQuery.data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/dashboard")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Brain className="h-8 w-8 text-purple-600" />
            Mindfulness Exercises
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Evidence-based techniques from MB-EAT to manage emotional eating and build awareness
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4 text-center">
              <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.totalSessions || 0}
              </div>
              <div className="text-sm text-gray-500">Total Sessions</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.totalMinutes || 0}
              </div>
              <div className="text-sm text-gray-500">Minutes Practiced</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4 text-center">
              <Flame className="h-6 w-6 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.currentStreak || 0}
              </div>
              <div className="text-sm text-gray-500">Day Streak</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4 text-center">
              <Star className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.sessionsThisWeek || 0}
              </div>
              <div className="text-sm text-gray-500">This Week</div>
            </CardContent>
          </Card>
        </div>

        {/* Active Session View */}
        {isSessionActive && selectedExercise && (
          <Card className="mb-8 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/50 dark:to-indigo-900/50 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{selectedExercise.name}</CardTitle>
                  <CardDescription>{selectedExercise.description}</CardDescription>
                </div>
                <Badge className={categoryColors[selectedExercise.category]}>
                  {categoryIcons[selectedExercise.category]}
                  <span className="ml-1">{categoryLabels[selectedExercise.category]}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Timer */}
              <div className="text-center mb-6">
                <div className="text-6xl font-mono font-bold text-purple-700 dark:text-purple-300 mb-4">
                  {formatTime(elapsedTime)}
                </div>
                <Progress 
                  value={(elapsedTime / (selectedExercise.duration * 60)) * 100} 
                  className="h-2 mb-4"
                />
                <div className="flex justify-center gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setIsPaused(!isPaused)}
                  >
                    {isPaused ? <Play className="h-5 w-5 mr-2" /> : <Pause className="h-5 w-5 mr-2" />}
                    {isPaused ? "Resume" : "Pause"}
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleCompleteSession}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Complete Session
                  </Button>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-2">Instructions:</h3>
                <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-sans">
                  {selectedExercise.instructions}
                </pre>
              </div>

              {/* Post-session feedback */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Mood After</label>
                  <Select value={moodAfter} onValueChange={setMoodAfter}>
                    <SelectTrigger>
                      <SelectValue placeholder="How do you feel now?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="very_low">Very Low</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="great">Great</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Craving Intensity After (1-10): {cravingAfter}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={cravingAfter}
                    onChange={(e) => setCravingAfter(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any thoughts or observations from this session..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        {!isSessionActive && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="library">Exercise Library</TabsTrigger>
              <TabsTrigger value="history">Session History</TabsTrigger>
            </TabsList>

            <TabsContent value="library">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 mb-6">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                >
                  All
                </Button>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <Button
                    key={key}
                    variant={selectedCategory === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(key)}
                    className="flex items-center gap-1"
                  >
                    {categoryIcons[key]}
                    {label}
                  </Button>
                ))}
              </div>

              {/* Exercise Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {filteredExercises.map((exercise) => (
                  <Card
                    key={exercise.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedExercise?.id === exercise.id
                        ? "ring-2 ring-purple-500"
                        : ""
                    }`}
                    onClick={() => setSelectedExercise(exercise)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${categoryColors[exercise.category]}`}>
                            {categoryIcons[exercise.category]}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{exercise.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {exercise.duration} min
                              </Badge>
                              <Badge variant="outline" className="text-xs capitalize">
                                {exercise.difficulty}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {exercise.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        <strong>Best for:</strong> {exercise.bestFor}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Selected Exercise Detail & Start */}
              {selectedExercise && (
                <Card className="mt-6 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950">
                  <CardHeader>
                    <CardTitle>Start {selectedExercise.name}</CardTitle>
                    <CardDescription>
                      Set your pre-session state to track your progress
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">What triggered this?</label>
                        <Select value={trigger} onValueChange={setTrigger}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select trigger" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="scheduled">Scheduled Practice</SelectItem>
                            <SelectItem value="craving">Food Craving</SelectItem>
                            <SelectItem value="stress">Stress</SelectItem>
                            <SelectItem value="emotional">Emotional Eating Urge</SelectItem>
                            <SelectItem value="before_meal">Before Meal</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Current Mood</label>
                        <Select value={moodBefore} onValueChange={setMoodBefore}>
                          <SelectTrigger>
                            <SelectValue placeholder="How do you feel?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="very_low">Very Low</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="neutral">Neutral</SelectItem>
                            <SelectItem value="good">Good</SelectItem>
                            <SelectItem value="great">Great</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Craving Intensity (1-10): {cravingBefore}
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={cravingBefore}
                          onChange={(e) => setCravingBefore(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>
                    <Button
                      size="lg"
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={handleStartSession}
                      disabled={startSessionMutation.isPending}
                    >
                      <Play className="h-5 w-5 mr-2" />
                      {startSessionMutation.isPending ? "Starting..." : "Begin Exercise"}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Sessions</CardTitle>
                  <CardDescription>Your mindfulness practice history</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentSessionsQuery.data && recentSessionsQuery.data.length > 0 ? (
                    <div className="space-y-4">
                      {recentSessionsQuery.data.map((item) => (
                        <div
                          key={item.session.id}
                          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${categoryColors[item.exercise.category]}`}>
                              {categoryIcons[item.exercise.category]}
                            </div>
                            <div>
                              <div className="font-medium">{item.exercise.name}</div>
                              <div className="text-sm text-gray-500">
                                {new Date(item.session.startedAt).toLocaleDateString()} •{" "}
                                {item.session.durationMinutes} min
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {item.session.completed ? (
                              <Badge className="bg-green-100 text-green-800">Completed</Badge>
                            ) : (
                              <Badge variant="outline">In Progress</Badge>
                            )}
                            {item.session.moodBefore && item.session.moodAfter && (
                              <div className="text-xs text-gray-500 mt-1">
                                Mood: {item.session.moodBefore} → {item.session.moodAfter}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No sessions yet. Start your first mindfulness exercise!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
