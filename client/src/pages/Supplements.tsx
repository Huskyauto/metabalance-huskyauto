import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Pill, Plus, ArrowLeft, Check } from "lucide-react";

const SUPPLEMENT_LIBRARY = [
  {
    id: "berberine",
    name: "Berberine",
    dosage: "500mg, 2-3 times daily",
    timing: "Before meals",
    benefits: [
      "Improves insulin sensitivity",
      "Activates AMPK (cellular energy regulator)",
      "Reduces blood sugar levels",
      "Supports weight loss (2-3 lbs over 12 weeks)",
      "Improves gut microbiome",
    ],
    evidence: "Multiple clinical trials show berberine is as effective as metformin for blood sugar control. Meta-analysis found significant BMI reduction.",
    considerations: "May cause digestive upset initially. Start with lower dose. Consult doctor if taking diabetes medications.",
  },
  {
    id: "probiotics",
    name: "Probiotics (Multi-strain)",
    dosage: "10-50 billion CFU daily",
    timing: "With or without food",
    benefits: [
      "Improves gut microbiome diversity",
      "Reduces inflammation",
      "Enhances metabolic health",
      "May reduce weight gain",
      "Improves insulin sensitivity",
    ],
    evidence: "Studies show specific strains (Lactobacillus, Bifidobacterium) can modestly reduce body weight and improve metabolic markers.",
    considerations: "Look for refrigerated products with multiple strains. Effects vary by individual gut composition.",
  },
  {
    id: "nmn",
    name: "NMN (Nicotinamide Mononucleotide)",
    dosage: "250-500mg daily",
    timing: "Morning, on empty stomach",
    benefits: [
      "Boosts NAD+ levels (cellular energy)",
      "Improves mitochondrial function",
      "May reverse metabolic aging",
      "Enhances insulin sensitivity",
      "Supports cellular repair",
    ],
    evidence: "Human trials show NMN safely increases NAD+ levels. Animal studies demonstrate metabolic improvements and longevity benefits.",
    considerations: "Emerging supplement with promising research. More expensive than alternatives like NR (nicotinamide riboside).",
  },
  {
    id: "resveratrol",
    name: "Resveratrol",
    dosage: "150-500mg daily",
    timing: "With meals (improves absorption)",
    benefits: [
      "Activates sirtuins (longevity genes)",
      "Improves mitochondrial function",
      "Anti-inflammatory effects",
      "May improve insulin sensitivity",
      "Supports cardiovascular health",
    ],
    evidence: "Animal studies show strong metabolic benefits. Human evidence is mixed but suggests modest improvements in insulin sensitivity.",
    considerations: "Bioavailability is low. Look for micronized or liposomal forms. Often combined with NMN for synergistic effects.",
  },
  {
    id: "omega3",
    name: "Omega-3 (EPA/DHA)",
    dosage: "1-2g EPA+DHA daily",
    timing: "With meals",
    benefits: [
      "Balances omega-6 to omega-3 ratio",
      "Reduces inflammation",
      "Supports heart health",
      "May reduce fat storage",
      "Improves insulin sensitivity",
    ],
    evidence: "Extensive research shows cardiovascular and anti-inflammatory benefits. May help counteract excess omega-6 from diet.",
    considerations: "Choose high-quality fish oil or algae-based omega-3. Check for third-party testing for purity.",
  },
  {
    id: "vitamin-d",
    name: "Vitamin D3",
    dosage: "2000-5000 IU daily",
    timing: "With fatty meal",
    benefits: [
      "Supports metabolic health",
      "Improves insulin sensitivity",
      "Reduces inflammation",
      "Essential for bone health",
      "Supports immune function",
    ],
    evidence: "Deficiency is common and linked to obesity and metabolic syndrome. Supplementation improves metabolic markers in deficient individuals.",
    considerations: "Get blood levels tested. Optimal range is 40-60 ng/mL. Fat-soluble vitamin - take with food containing fat.",
  },
  {
    id: "magnesium",
    name: "Magnesium",
    dosage: "300-400mg daily",
    timing: "Evening (may promote relaxation)",
    benefits: [
      "Improves insulin sensitivity",
      "Supports energy production",
      "Reduces stress and improves sleep",
      "Essential for 300+ enzymatic reactions",
      "May reduce inflammation",
    ],
    evidence: "Deficiency is common and associated with insulin resistance. Supplementation improves glucose metabolism and sleep quality.",
    considerations: "Magnesium glycinate or citrate are well-absorbed forms. May have mild laxative effect at high doses.",
  },
];

export default function Supplements() {
  const [, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSupplement, setSelectedSupplement] = useState<string | undefined>("");
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    timing: "",
    notes: "",
  });

  const utils = trpc.useUtils();
  const { data: mySupplements, isLoading } = trpc.supplements.listActive.useQuery();

  const createSupplement = trpc.supplements.create.useMutation({
    onSuccess: () => {
      toast.success("Supplement added to your tracker!");
      utils.supplements.listActive.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to add supplement: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      dosage: "",
      timing: "",
      notes: "",
    });
    setSelectedSupplement("");
  };

  const handleSelectFromLibrary = (supplement: typeof SUPPLEMENT_LIBRARY[0]) => {
    setFormData({
      name: supplement.name,
      dosage: supplement.dosage,
      timing: supplement.timing,
      notes: "",
    });
    setSelectedSupplement(supplement.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSupplement.mutate({
      name: formData.name,
      type: "other" as const,
      dosage: formData.dosage || "As directed",
      frequency: "daily",
      timing: formData.timing || undefined,
      startDate: new Date(),
      notes: formData.notes || undefined,
    });
  };

  const isSupplementTracked = (supplementId: string) => {
    return mySupplements?.some(
      (s: any) => s.name.toLowerCase() === SUPPLEMENT_LIBRARY.find((lib) => lib.id === supplementId)?.name.toLowerCase()
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      <div className="container py-8 max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Pill className="h-8 w-8 text-purple-600" />
              Supplements
            </h1>
            <p className="text-muted-foreground">Evidence-based supplements for metabolic health</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Supplement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Supplement to Your Tracker</DialogTitle>
                <DialogDescription>Choose from our library or add your own</DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="library" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="library">From Library</TabsTrigger>
                  <TabsTrigger value="custom">Custom</TabsTrigger>
                </TabsList>
                
                <TabsContent value="library" className="space-y-4">
                  <div className="grid gap-3 max-h-96 overflow-y-auto">
                    {SUPPLEMENT_LIBRARY.map((supplement) => (
                      <Card
                        key={supplement.id}
                        className={`cursor-pointer transition-all ${
                          selectedSupplement === supplement.id
                            ? "ring-2 ring-primary"
                            : "hover:shadow-md"
                        } ${isSupplementTracked(supplement.id) ? "opacity-60" : ""}`}
                        onClick={() => !isSupplementTracked(supplement.id) && handleSelectFromLibrary(supplement)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-base">{supplement.name}</CardTitle>
                            {isSupplementTracked(supplement.id) && (
                              <Badge variant="secondary" className="ml-2">
                                <Check className="h-3 w-3 mr-1" />
                                Tracked
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="text-xs">
                            {supplement.dosage} • {supplement.timing}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                  
                  {selectedSupplement && (
                    <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t">
                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes (optional)</Label>
                        <Input
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          placeholder="Any personal notes or reminders..."
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createSupplement.isPending}>
                          {createSupplement.isPending ? "Adding..." : "Add to Tracker"}
                        </Button>
                      </div>
                    </form>
                  )}
                </TabsContent>
                
                <TabsContent value="custom">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="customName">Supplement Name *</Label>
                      <Input
                        id="customName"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Vitamin C"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customDosage">Dosage</Label>
                      <Input
                        id="customDosage"
                        value={formData.dosage}
                        onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                        placeholder="e.g., 1000mg daily"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customTiming">Timing</Label>
                      <Input
                        id="customTiming"
                        value={formData.timing}
                        onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
                        placeholder="e.g., With breakfast"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customNotes">Notes</Label>
                      <Input
                        id="customNotes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Any personal notes..."
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createSupplement.isPending}>
                        {createSupplement.isPending ? "Adding..." : "Add Supplement"}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="library" className="space-y-6">
          <TabsList>
            <TabsTrigger value="library">Supplement Library</TabsTrigger>
            <TabsTrigger value="tracker">My Supplements ({mySupplements?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="space-y-6">
            {SUPPLEMENT_LIBRARY.map((supplement) => (
              <Card key={supplement.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{supplement.name}</CardTitle>
                      <CardDescription className="mt-1">
                        <strong>Dosage:</strong> {supplement.dosage} • <strong>Timing:</strong> {supplement.timing}
                      </CardDescription>
                    </div>
                    {isSupplementTracked(supplement.id) ? (
                      <Badge variant="secondary">
                        <Check className="h-3 w-3 mr-1" />
                        Tracked
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => {
                          handleSelectFromLibrary(supplement);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Track
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Benefits:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {supplement.benefits.map((benefit, idx) => (
                        <li key={idx}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Evidence:</h4>
                    <p className="text-sm text-muted-foreground">{supplement.evidence}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Considerations:</h4>
                    <p className="text-sm text-muted-foreground">{supplement.considerations}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="tracker">
            {isLoading ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Loading your supplements...
                </CardContent>
              </Card>
            ) : mySupplements && mySupplements.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {mySupplements.map((supplement: any) => (
                  <Card key={supplement.id}>
                    <CardHeader>
                      <CardTitle>{supplement.name}</CardTitle>
                      {supplement.dosage && (
                        <CardDescription>
                          <strong>Dosage:</strong> {supplement.dosage}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {supplement.timing && (
                        <p className="text-sm">
                          <strong>Timing:</strong> {supplement.timing}
                        </p>
                      )}
                      {supplement.notes && (
                        <p className="text-sm text-muted-foreground italic">Note: {supplement.notes}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No supplements tracked yet</p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Supplement
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
