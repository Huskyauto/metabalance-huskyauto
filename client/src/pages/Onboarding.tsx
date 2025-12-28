import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Activity, Target, Heart, Pill, Moon, TrendingDown } from "lucide-react";

type Step = 1 | 2 | 3 | 4;

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<Step>(1);
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

  const upsertProfile = trpc.profile.upsert.useMutation({
    onSuccess: () => {
      toast.success("Profile saved successfully!");
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error("Failed to save profile: " + error.message);
    },
  });

  const handleNext = () => {
    if (step < 4) {
      setStep((prev) => (prev + 1) as Step);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as Step);
    }
  };

  const handleSubmit = () => {
    upsertProfile.mutate({
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

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.currentWeight && formData.targetWeight && formData.height && formData.age;
      case 2:
        return true;
      case 3:
        return true;
      case 4:
        return formData.primaryGoal.trim().length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Welcome to MetaBalance</CardTitle>
              <CardDescription>Let's personalize your metabolic health journey</CardDescription>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Basic Metrics</h3>
              </div>
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
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Health Conditions</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasObesity"
                    checked={formData.hasObesity}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasObesity: checked as boolean })}
                  />
                  <Label htmlFor="hasObesity" className="font-normal cursor-pointer">I have been diagnosed with obesity</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasDiabetes"
                    checked={formData.hasDiabetes}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasDiabetes: checked as boolean })}
                  />
                  <Label htmlFor="hasDiabetes" className="font-normal cursor-pointer">I have diabetes or prediabetes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasMetabolicSyndrome"
                    checked={formData.hasMetabolicSyndrome}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasMetabolicSyndrome: checked as boolean })}
                  />
                  <Label htmlFor="hasMetabolicSyndrome" className="font-normal cursor-pointer">I have metabolic syndrome</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasNAFLD"
                    checked={formData.hasNAFLD}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasNAFLD: checked as boolean })}
                  />
                  <Label htmlFor="hasNAFLD" className="font-normal cursor-pointer">I have fatty liver disease (NAFLD)</Label>
                </div>
              </div>
              <div className="space-y-2 pt-4">
                <Label htmlFor="currentMedications">Current Medications (optional)</Label>
                <Textarea
                  id="currentMedications"
                  value={formData.currentMedications}
                  onChange={(e) => setFormData({ ...formData, currentMedications: e.target.value })}
                  placeholder="List any medications you're currently taking..."
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="takingGLP1"
                  checked={formData.takingGLP1}
                  onCheckedChange={(checked) => setFormData({ ...formData, takingGLP1: checked as boolean })}
                />
                <Label htmlFor="takingGLP1" className="font-normal cursor-pointer">I'm taking GLP-1 medication (Ozempic, Wegovy, etc.)</Label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Moon className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Lifestyle Factors</h3>
              </div>
              <div className="space-y-2">
                <Label>Stress Level</Label>
                <RadioGroup
                  value={formData.stressLevel}
                  onValueChange={(value) => setFormData({ ...formData, stressLevel: value as any })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="stress-low" />
                    <Label htmlFor="stress-low" className="font-normal cursor-pointer">Low</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moderate" id="stress-moderate" />
                    <Label htmlFor="stress-moderate" className="font-normal cursor-pointer">Moderate</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="stress-high" />
                    <Label htmlFor="stress-high" className="font-normal cursor-pointer">High</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>Sleep Quality</Label>
                <RadioGroup
                  value={formData.sleepQuality}
                  onValueChange={(value) => setFormData({ ...formData, sleepQuality: value as any })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="poor" id="sleep-poor" />
                    <Label htmlFor="sleep-poor" className="font-normal cursor-pointer">Poor</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fair" id="sleep-fair" />
                    <Label htmlFor="sleep-fair" className="font-normal cursor-pointer">Fair</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="good" id="sleep-good" />
                    <Label htmlFor="sleep-good" className="font-normal cursor-pointer">Good</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="excellent" id="sleep-excellent" />
                    <Label htmlFor="sleep-excellent" className="font-normal cursor-pointer">Excellent</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>Activity Level</Label>
                <RadioGroup
                  value={formData.activityLevel}
                  onValueChange={(value) => setFormData({ ...formData, activityLevel: value as any })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sedentary" id="activity-sedentary" />
                    <Label htmlFor="activity-sedentary" className="font-normal cursor-pointer">Sedentary (little to no exercise)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="activity-light" />
                    <Label htmlFor="activity-light" className="font-normal cursor-pointer">Light (1-2 days/week)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moderate" id="activity-moderate" />
                    <Label htmlFor="activity-moderate" className="font-normal cursor-pointer">Moderate (3-5 days/week)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="active" id="activity-active" />
                    <Label htmlFor="activity-active" className="font-normal cursor-pointer">Active (6-7 days/week)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="very_active" id="activity-very-active" />
                    <Label htmlFor="activity-very-active" className="font-normal cursor-pointer">Very Active (athlete level)</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Your Goals & Risk Factors</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryGoal">What is your primary goal?</Label>
                <Textarea
                  id="primaryGoal"
                  value={formData.primaryGoal}
                  onChange={(e) => setFormData({ ...formData, primaryGoal: e.target.value })}
                  placeholder="e.g., Lose 40 lbs and reverse my prediabetes within 6 months..."
                  rows={4}
                />
              </div>
              <div className="space-y-3 pt-4">
                <p className="text-sm text-muted-foreground">Based on research, you may have these risk factors:</p>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="susceptibleToLinoleicAcid"
                    checked={formData.susceptibleToLinoleicAcid}
                    onCheckedChange={(checked) => setFormData({ ...formData, susceptibleToLinoleicAcid: checked as boolean })}
                  />
                  <Label htmlFor="susceptibleToLinoleicAcid" className="font-normal cursor-pointer">Susceptible to linoleic acid (soybean/corn oil)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lowNADLevels"
                    checked={formData.lowNADLevels}
                    onCheckedChange={(checked) => setFormData({ ...formData, lowNADLevels: checked as boolean })}
                  />
                  <Label htmlFor="lowNADLevels" className="font-normal cursor-pointer">Low NAD+ levels (cellular aging)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="poorGutHealth"
                    checked={formData.poorGutHealth}
                    onCheckedChange={(checked) => setFormData({ ...formData, poorGutHealth: checked as boolean })}
                  />
                  <Label htmlFor="poorGutHealth" className="font-normal cursor-pointer">Poor gut microbiome health</Label>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed() || upsertProfile.isPending}
            >
              {step === 4 ? (upsertProfile.isPending ? "Saving..." : "Complete") : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
