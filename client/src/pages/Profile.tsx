import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { User, ArrowLeft, Save } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { data: profile, isLoading } = trpc.profile.get.useQuery(undefined, {
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
  const utils = trpc.useUtils();

  const [formData, setFormData] = useState({
    currentWeight: "",
    targetWeight: "",
    height: "",
    age: "",
    gender: "other" as "male" | "female" | "other",
    hasObesity: false,
    hasDiabetes: false,
    hasMetabolicSyndrome: false,
    hasNAFLD: false,
    currentMedications: "",
    takingGLP1: false,
    stressLevel: "moderate" as "low" | "moderate" | "high",
    sleepQuality: "fair" as "poor" | "fair" | "good" | "excellent",
    activityLevel: "moderate" as "sedentary" | "light" | "moderate" | "active" | "very_active",
    susceptibleToLinoleicAcid: false,
    lowNADLevels: false,
    poorGutHealth: false,
    primaryGoal: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        currentWeight: profile.currentWeight?.toString() || "",
        targetWeight: profile.targetWeight?.toString() || "",
        height: profile.height?.toString() || "",
        age: profile.age?.toString() || "",
        gender: profile.gender || "other",
        hasObesity: profile.hasObesity || false,
        hasDiabetes: profile.hasDiabetes || false,
        hasMetabolicSyndrome: profile.hasMetabolicSyndrome || false,
        hasNAFLD: profile.hasNAFLD || false,
        currentMedications: profile.currentMedications || "",
        takingGLP1: profile.takingGLP1 || false,
        stressLevel: profile.stressLevel || "moderate",
        sleepQuality: profile.sleepQuality || "fair",
        activityLevel: profile.activityLevel || "moderate",
        susceptibleToLinoleicAcid: profile.susceptibleToLinoleicAcid || false,
        lowNADLevels: profile.lowNADLevels || false,
        poorGutHealth: profile.poorGutHealth || false,
        primaryGoal: profile.primaryGoal || "",
      });
    }
  }, [profile]);

  const updateProfile = trpc.profile.upsert.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      utils.profile.get.invalidate();
      utils.progress.latest.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to update profile: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({
      currentWeight: formData.currentWeight ? parseInt(formData.currentWeight) : undefined,
      targetWeight: formData.targetWeight ? parseInt(formData.targetWeight) : undefined,
      height: formData.height ? parseInt(formData.height) : undefined,
      age: formData.age ? parseInt(formData.age) : undefined,
      gender: formData.gender,
      hasObesity: formData.hasObesity,
      hasDiabetes: formData.hasDiabetes,
      hasMetabolicSyndrome: formData.hasMetabolicSyndrome,
      hasNAFLD: formData.hasNAFLD,
      currentMedications: formData.currentMedications || undefined,
      takingGLP1: formData.takingGLP1,
      stressLevel: formData.stressLevel,
      sleepQuality: formData.sleepQuality,
      activityLevel: formData.activityLevel,
      susceptibleToLinoleicAcid: formData.susceptibleToLinoleicAcid,
      lowNADLevels: formData.lowNADLevels,
      poorGutHealth: formData.poorGutHealth,
      primaryGoal: formData.primaryGoal || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
        <div className="container py-8 max-w-4xl">
          <Skeleton className="h-12 w-64 mb-8" />
          <Card>
            <CardContent className="py-8">
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      <div className="container py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <User className="h-8 w-8 text-primary" />
              Profile & Settings
            </h1>
            <p className="text-muted-foreground">Update your metabolic health information</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Metrics</CardTitle>
              <CardDescription>Your current measurements and goals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentWeight">Current Weight (lbs)</Label>
                  <Input
                    id="currentWeight"
                    type="number"
                    value={formData.currentWeight}
                    onChange={(e) => setFormData({ ...formData, currentWeight: e.target.value })}
                    placeholder="e.g., 200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetWeight">Target Weight (lbs)</Label>
                  <Input
                    id="targetWeight"
                    type="number"
                    value={formData.targetWeight}
                    onChange={(e) => setFormData({ ...formData, targetWeight: e.target.value })}
                    placeholder="e.g., 160"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">Height (inches)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    placeholder="e.g., 68"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="e.g., 35"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <RadioGroup
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value as any })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male" className="font-normal cursor-pointer">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female" className="font-normal cursor-pointer">Female</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other" className="font-normal cursor-pointer">Other</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Health Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>Health Conditions</CardTitle>
              <CardDescription>Current diagnoses and medications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasObesity"
                    checked={formData.hasObesity}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasObesity: checked as boolean })}
                  />
                  <Label htmlFor="hasObesity" className="font-normal cursor-pointer">Diagnosed with obesity</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasDiabetes"
                    checked={formData.hasDiabetes}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasDiabetes: checked as boolean })}
                  />
                  <Label htmlFor="hasDiabetes" className="font-normal cursor-pointer">Diabetes or prediabetes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasMetabolicSyndrome"
                    checked={formData.hasMetabolicSyndrome}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasMetabolicSyndrome: checked as boolean })}
                  />
                  <Label htmlFor="hasMetabolicSyndrome" className="font-normal cursor-pointer">Metabolic syndrome</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasNAFLD"
                    checked={formData.hasNAFLD}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasNAFLD: checked as boolean })}
                  />
                  <Label htmlFor="hasNAFLD" className="font-normal cursor-pointer">Fatty liver disease (NAFLD)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="takingGLP1"
                    checked={formData.takingGLP1}
                    onCheckedChange={(checked) => setFormData({ ...formData, takingGLP1: checked as boolean })}
                  />
                  <Label htmlFor="takingGLP1" className="font-normal cursor-pointer">Taking GLP-1 medication</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentMedications">Current Medications</Label>
                <Textarea
                  id="currentMedications"
                  value={formData.currentMedications}
                  onChange={(e) => setFormData({ ...formData, currentMedications: e.target.value })}
                  placeholder="List any medications you're currently taking..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Lifestyle Factors */}
          <Card>
            <CardHeader>
              <CardTitle>Lifestyle Factors</CardTitle>
              <CardDescription>Stress, sleep, and activity levels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stressLevel">Stress Level</Label>
                <Select
                  value={formData.stressLevel}
                  onValueChange={(value) => setFormData({ ...formData, stressLevel: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sleepQuality">Sleep Quality</Label>
                <Select
                  value={formData.sleepQuality}
                  onValueChange={(value) => setFormData({ ...formData, sleepQuality: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="poor">Poor</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="excellent">Excellent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="activityLevel">Activity Level</Label>
                <Select
                  value={formData.activityLevel}
                  onValueChange={(value) => setFormData({ ...formData, activityLevel: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
                    <SelectItem value="light">Light (1-2 days/week)</SelectItem>
                    <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                    <SelectItem value="active">Active (6-7 days/week)</SelectItem>
                    <SelectItem value="very_active">Very Active (athlete level)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Goals & Risk Factors */}
          <Card>
            <CardHeader>
              <CardTitle>Goals & Risk Factors</CardTitle>
              <CardDescription>Your primary goal and metabolic risk factors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primaryGoal">Primary Goal</Label>
                <Textarea
                  id="primaryGoal"
                  value={formData.primaryGoal}
                  onChange={(e) => setFormData({ ...formData, primaryGoal: e.target.value })}
                  placeholder="e.g., Lose 40 lbs and reverse my prediabetes within 6 months..."
                  rows={4}
                />
              </div>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Metabolic Risk Factors:</p>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="susceptibleToLinoleicAcid"
                    checked={formData.susceptibleToLinoleicAcid}
                    onCheckedChange={(checked) => setFormData({ ...formData, susceptibleToLinoleicAcid: checked as boolean })}
                  />
                  <Label htmlFor="susceptibleToLinoleicAcid" className="font-normal cursor-pointer">
                    Susceptible to linoleic acid (soybean/corn oil)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lowNADLevels"
                    checked={formData.lowNADLevels}
                    onCheckedChange={(checked) => setFormData({ ...formData, lowNADLevels: checked as boolean })}
                  />
                  <Label htmlFor="lowNADLevels" className="font-normal cursor-pointer">
                    Low NAD+ levels (cellular aging)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="poorGutHealth"
                    checked={formData.poorGutHealth}
                    onCheckedChange={(checked) => setFormData({ ...formData, poorGutHealth: checked as boolean })}
                  />
                  <Label htmlFor="poorGutHealth" className="font-normal cursor-pointer">
                    Poor gut microbiome health
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => setLocation("/dashboard")}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateProfile.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {updateProfile.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
