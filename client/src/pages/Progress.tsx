import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { TrendingDown, Plus, ArrowLeft, Trash2, Download } from "lucide-react";
import { format } from "date-fns";

export default function Progress() {
  const [, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    weight: "",
    waist: "",
    hips: "",
    chest: "",
    notes: "",
  });

  const utils = trpc.useUtils();
  const { data: progressEntries, isLoading } = trpc.progress.list.useQuery({});
  const { data: profile } = trpc.profile.get.useQuery();

  const checkAchievements = trpc.achievements.checkUnlocks.useMutation();
  
  const createProgress = trpc.progress.create.useMutation({
    onSuccess: () => {
      toast.success("Progress logged successfully!");
      utils.progress.list.invalidate();
      utils.progress.latest.invalidate();
      setIsDialogOpen(false);
      resetForm();
      // Check for weight loss achievements
      checkAchievements.mutate();
    },
    onError: (error) => {
      toast.error("Failed to log progress: " + error.message);
    },
  });

  // Note: Delete functionality would require a delete procedure in routers.ts
  const deleteProgress = { mutate: (params: { id: number }) => {
    toast.error("Delete functionality coming soon");
  } } as any;

  const resetForm = () => {
    setFormData({
      weight: "",
      waist: "",
      hips: "",
      chest: "",
      notes: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProgress.mutate({
      loggedAt: new Date(),
      weight: formData.weight ? parseInt(formData.weight) : undefined,
      waistCircumference: formData.waist ? parseInt(formData.waist) : undefined,
      hipCircumference: formData.hips ? parseInt(formData.hips) : undefined,
      chestCircumference: formData.chest ? parseInt(formData.chest) : undefined,
      notes: formData.notes || undefined,
    });
  };

  const getWeightChange = () => {
    if (!progressEntries || progressEntries.length < 2) return null;
    const latest = progressEntries[0];
    const previous = progressEntries[1];
    if (!latest?.weight || !previous?.weight) return null;
    const change = latest.weight - previous.weight;
    return {
      amount: Math.abs(change),
      direction: change < 0 ? "down" : "up",
    };
  };

  const weightChange = getWeightChange();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      <div className="container py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <TrendingDown className="h-8 w-8 text-pink-600" />
              Progress Tracking
            </h1>
            <p className="text-muted-foreground">Track your weight and measurements over time</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={async () => {
              try {
                toast.loading("Generating PDF...");
                const result = await utils.client.progress.exportPDF.query();
                const blob = new Blob([Uint8Array.from(atob(result.pdf), c => c.charCodeAt(0))], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = result.filename;
                a.click();
                URL.revokeObjectURL(url);
                toast.dismiss();
                toast.success("Progress report downloaded!");
              } catch (error) {
                toast.dismiss();
                toast.error("Failed to generate PDF");
              }
            }}>
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Log Progress
                </Button>
              </DialogTrigger>
              <DialogContent>
              <DialogHeader>
                <DialogTitle>Log Your Progress</DialogTitle>
                <DialogDescription>Record your current weight and measurements</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (lbs)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="e.g., 195"
                    step="0.1"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="waist">Waist (in)</Label>
                    <Input
                      id="waist"
                      type="number"
                      value={formData.waist}
                      onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                      placeholder="e.g., 36"
                      step="0.1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hips">Hips (in)</Label>
                    <Input
                      id="hips"
                      type="number"
                      value={formData.hips}
                      onChange={(e) => setFormData({ ...formData, hips: e.target.value })}
                      placeholder="e.g., 40"
                      step="0.1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chest">Chest (in)</Label>
                    <Input
                      id="chest"
                      type="number"
                      value={formData.chest}
                      onChange={(e) => setFormData({ ...formData, chest: e.target.value })}
                      placeholder="e.g., 42"
                      step="0.1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="How are you feeling today?"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createProgress.isPending}>
                    {createProgress.isPending ? "Logging..." : "Log Progress"}
                  </Button>
                </div>
              </form>
            </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current Weight</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {progressEntries && progressEntries.length > 0 && progressEntries[0]?.weight
                  ? progressEntries[0].weight
                  : profile?.currentWeight || "--"}{" "}
                <span className="text-lg font-normal text-muted-foreground">lbs</span>
              </div>
              {weightChange && (
                <p className={`text-sm mt-2 ${weightChange.direction === "down" ? "text-green-600" : "text-orange-600"}`}>
                  {weightChange.direction === "down" ? "↓" : "↑"} {weightChange.amount} lbs from last entry
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Target Weight</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {profile?.targetWeight || "--"} <span className="text-lg font-normal text-muted-foreground">lbs</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{progressEntries?.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Entries */}
        <div className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Loading progress entries...
              </CardContent>
            </Card>
          ) : progressEntries && progressEntries.length > 0 ? (
            progressEntries.map((entry) => (
              <Card key={entry.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {format(new Date(entry.loggedAt), "MMMM d, yyyy")}
                      </CardTitle>
                      <CardDescription>
                        {format(new Date(entry.loggedAt), "h:mm a")}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteProgress.mutate({ id: entry.id })}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {entry.weight && (
                      <div>
                        <p className="text-sm text-muted-foreground">Weight</p>
                        <p className="text-2xl font-bold">{entry.weight} <span className="text-sm font-normal">lbs</span></p>
                      </div>
                    )}
                    {entry.waistCircumference && (
                      <div>
                        <p className="text-sm text-muted-foreground">Waist</p>
                        <p className="text-2xl font-bold">{entry.waistCircumference} <span className="text-sm font-normal">in</span></p>
                      </div>
                    )}
                    {entry.hipCircumference && (
                      <div>
                        <p className="text-sm text-muted-foreground">Hips</p>
                        <p className="text-2xl font-bold">{entry.hipCircumference} <span className="text-sm font-normal">in</span></p>
                      </div>
                    )}
                    {entry.chestCircumference && (
                      <div>
                        <p className="text-sm text-muted-foreground">Chest</p>
                        <p className="text-2xl font-bold">{entry.chestCircumference} <span className="text-sm font-normal">in</span></p>
                      </div>
                    )}
                  </div>
                  {entry.notes && (
                    <p className="text-sm text-muted-foreground italic">Note: {entry.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <TrendingDown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No progress entries yet</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Log Your First Entry
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
