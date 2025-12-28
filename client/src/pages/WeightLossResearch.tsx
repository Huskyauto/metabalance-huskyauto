import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, BookOpen, TrendingUp, Pill, Clock, Utensils, Activity, History, RefreshCw } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";

// Research History Component
function ResearchHistory() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { data: history, isLoading } = trpc.research.getHistory.useQuery({
    category: selectedCategory === "all" ? undefined : selectedCategory as any,
    limit: 20
  });

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      overview: "Overview",
      glp1: "GLP-1 Drugs",
      fasting: "Fasting",
      nutrition: "Nutrition",
      exercise: "Exercise",
      metabolic: "Metabolic"
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      overview: "emerald",
      glp1: "purple",
      fasting: "blue",
      nutrition: "orange",
      exercise: "red",
      metabolic: "teal"
    };
    return colors[category] || "gray";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading research history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-gray-200 bg-white/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-900">Research History</CardTitle>
          <CardDescription>
            View your past research generations and track how findings evolve over time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Filter by category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Categories</option>
              <option value="overview">Overview</option>
              <option value="glp1">GLP-1 Drugs</option>
              <option value="fasting">Fasting</option>
              <option value="nutrition">Nutrition</option>
              <option value="exercise">Exercise</option>
              <option value="metabolic">Metabolic</option>
            </select>
          </div>

          {/* History List */}
          {!history || history.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No research history yet</p>
              <p className="text-sm text-gray-400 mt-1">Generate research to start building your history</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((entry: any) => {
                const color = getCategoryColor(entry.category);
                return (
                  <Card key={entry.id} className={`border-${color}-200 hover:shadow-md transition-shadow`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 bg-${color}-100 text-${color}-700 text-xs font-medium rounded`}>
                              {getCategoryLabel(entry.category)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(entry.generatedAt)}
                            </span>
                          </div>
                          <CardDescription className="text-sm line-clamp-2">
                            {entry.content.substring(0, 150)}...
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function WeightLossResearch() {
  const [, setLocation] = useLocation();
  const navigate = (path: string) => setLocation(path);
  const [activeTab, setActiveTab] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const utils = trpc.useUtils();
  
  // Always generate fresh research on page load
  const { data: freshResearch, isLoading: loadingFresh, refetch: refetchResearch } = trpc.research.getLatestResearch.useQuery(
    undefined,
    { 
      staleTime: 0, // Never use stale data
      refetchOnMount: true // Always refetch when component mounts
    }
  );
  
  // Load research history separately (for History tab only)
  const { data: researchHistory } = trpc.research.getHistory.useQuery(
    { limit: 10 },
    { staleTime: 1000 * 60 * 5 } // Cache history for 5 minutes
  );
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchResearch();
      await utils.research.getHistory.invalidate();
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const researchData: Record<string, string> = freshResearch || {};
  const isLoading = loadingFresh;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">
                {loadingFresh ? "Generating latest research..." : "Loading research from database..."}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                {loadingFresh ? "This may take 10-20 seconds as we compile the latest findings" : "This should only take a moment"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Weight Loss Research</h1>
                <p className="text-gray-600 mt-1">Latest scientific findings and evidence-based strategies</p>
                <p className="text-gray-500 text-sm mt-1">
                  Fresh research generated on every visit
                </p>
              </div>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Research'}
            </Button>
          </div>
        </div>

        {/* Research Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7 gap-2">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="glp1" className="flex items-center gap-2">
              <Pill className="h-4 w-4" />
              <span>GLP-1</span>
            </TabsTrigger>
            <TabsTrigger value="fasting" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Fasting</span>
            </TabsTrigger>
            <TabsTrigger value="nutrition" className="flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              <span>Nutrition</span>
            </TabsTrigger>
            <TabsTrigger value="exercise" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>Exercise</span>
            </TabsTrigger>
            <TabsTrigger value="metabolic" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Metabolic</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span>History</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="border-emerald-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-2xl text-emerald-900">2024-2025 Weight Loss Research Overview</CardTitle>
                <CardDescription>Key findings from the latest scientific studies</CardDescription>
              </CardHeader>
              <CardContent className="prose prose-emerald max-w-none">
                <Streamdown>
                  {researchData?.overview || "Loading research overview..."}
                </Streamdown>
              </CardContent>
            </Card>
          </TabsContent>

          {/* GLP-1 Tab */}
          <TabsContent value="glp1" className="space-y-6">
            <Card className="border-purple-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-2xl text-purple-900">GLP-1 Medications Research</CardTitle>
                <CardDescription>Latest findings on semaglutide, tirzepatide, and emerging therapies</CardDescription>
              </CardHeader>
              <CardContent className="prose prose-purple max-w-none">
                <Streamdown>
                  {researchData?.glp1 || "Loading GLP-1 research..."}
                </Streamdown>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fasting Tab */}
          <TabsContent value="fasting" className="space-y-6">
            <Card className="border-blue-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-2xl text-blue-900">Intermittent Fasting Research</CardTitle>
                <CardDescription>Scientific evidence on time-restricted eating and metabolic benefits</CardDescription>
              </CardHeader>
              <CardContent className="prose prose-blue max-w-none">
                <Streamdown>
                  {researchData?.fasting || "Loading fasting research..."}
                </Streamdown>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nutrition Tab */}
          <TabsContent value="nutrition" className="space-y-6">
            <Card className="border-orange-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-2xl text-orange-900">Nutrition Science</CardTitle>
                <CardDescription>Evidence-based dietary strategies for weight loss and metabolic health</CardDescription>
              </CardHeader>
              <CardContent className="prose prose-orange max-w-none">
                <Streamdown>
                  {researchData?.nutrition || "Loading nutrition research..."}
                </Streamdown>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exercise Tab */}
          <TabsContent value="exercise" className="space-y-6">
            <Card className="border-red-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-2xl text-red-900">Exercise & Physical Activity</CardTitle>
                <CardDescription>Latest research on exercise for weight loss and metabolic health</CardDescription>
              </CardHeader>
              <CardContent className="prose prose-red max-w-none">
                <Streamdown>
                  {researchData?.exercise || "Loading exercise research..."}
                </Streamdown>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Metabolic Tab */}
          <TabsContent value="metabolic" className="space-y-6">
            <Card className="border-teal-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-2xl text-teal-900">Metabolic Health Research</CardTitle>
                <CardDescription>Cellular mechanisms, mitochondrial function, and metabolic optimization</CardDescription>
              </CardHeader>
              <CardContent className="prose prose-teal max-w-none">
                <Streamdown>
                  {researchData?.metabolic || "Loading metabolic research..."}
                </Streamdown>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <ResearchHistory />
          </TabsContent>
        </Tabs>

        {/* Disclaimer */}
        <Card className="mt-8 border-amber-200 bg-amber-50/50">
          <CardContent className="pt-6">
            <p className="text-sm text-amber-900">
              <strong>Medical Disclaimer:</strong> This research summary is for informational purposes only and does not constitute medical advice. 
              Always consult with qualified healthcare professionals before making changes to your diet, exercise routine, or medication regimen. 
              Individual results may vary, and what works for one person may not work for another.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
