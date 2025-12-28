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
import { ArrowLeft, Plus, Pill, CheckCircle2, XCircle } from "lucide-react";
import { useLocation } from "wouter";

const medicationTypeLabels = {
  glp1_agonist: "GLP-1 Agonist",
  ssri: "SSRI",
  stimulant: "Stimulant",
  combination: "Combination",
  other: "Other",
};

export default function Medications() {
  const [, setLocation] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [type, setType] = useState<string>("other");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [startDate, setStartDate] = useState("");
  const [prescribedFor, setPrescribedFor] = useState("");
  const [notes, setNotes] = useState("");

  // Queries
  const { data: medications, refetch: refetchMedications } = trpc.emotionalEating.getMedications.useQuery({ activeOnly: false });

  // Mutations
  const addMedication = trpc.emotionalEating.addMedication.useMutation({
    onSuccess: () => {
      toast.success("Medication added successfully");
      setDialogOpen(false);
      resetForm();
      refetchMedications();
    },
    onError: (error) => {
      toast.error("Error adding medication: " + error.message);
    },
  });

  const resetForm = () => {
    setName("");
    setType("other");
    setDosage("");
    setFrequency("");
    setStartDate("");
    setPrescribedFor("");
    setNotes("");
  };

  const handleSubmit = () => {
    if (!name.trim() || !dosage.trim() || !frequency.trim() || !startDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    addMedication.mutate({
      name,
      type: type as any,
      dosage,
      frequency,
      startDate,
      prescribedFor: prescribedFor || undefined,
      notes: notes || undefined,
      active: true,
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
              <h1 className="text-3xl font-bold">Medication Tracker</h1>
              <p className="text-muted-foreground">
                Track medications for emotional eating and metabolic health
              </p>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Medication
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Medication</DialogTitle>
                <DialogDescription>
                  Track medications including GLP-1 agonists, SSRIs, and other treatments
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Medication Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Semaglutide, Fluoxetine, Lisdexamfetamine..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="glp1_agonist">GLP-1 Agonist (Semaglutide, Liraglutide)</SelectItem>
                      <SelectItem value="ssri">SSRI (Fluoxetine, Sertraline)</SelectItem>
                      <SelectItem value="stimulant">Stimulant (Lisdexamfetamine/Vyvanse)</SelectItem>
                      <SelectItem value="combination">Combination (Bupropion/Naltrexone)</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dosage">Dosage *</Label>
                    <Input
                      id="dosage"
                      placeholder="e.g., 1mg, 20mg, 0.5ml"
                      value={dosage}
                      onChange={(e) => setDosage(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency *</Label>
                    <Input
                      id="frequency"
                      placeholder="e.g., once daily, weekly"
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prescribedFor">Prescribed For</Label>
                  <Input
                    id="prescribedFor"
                    placeholder="e.g., Binge Eating Disorder, Weight Loss, Depression"
                    value={prescribedFor}
                    onChange={(e) => setPrescribedFor(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional information..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={addMedication.isPending}>
                  {addMedication.isPending ? "Adding..." : "Add Medication"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Medications List */}
        <div className="grid gap-4">
          {!medications || medications.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <Pill className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No medications tracked yet.</p>
                  <p className="text-sm mt-2">Add your first medication to start tracking.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            medications.map((med) => (
              <Card key={med.id} className={!med.active ? "opacity-60" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Pill className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-xl">{med.name}</CardTitle>
                        <CardDescription>
                          {medicationTypeLabels[med.type as keyof typeof medicationTypeLabels]}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {med.active ? (
                        <span className="flex items-center gap-1 text-sm text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <XCircle className="h-4 w-4" />
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Dosage:</span> {med.dosage}
                    </div>
                    <div>
                      <span className="font-medium">Frequency:</span> {med.frequency}
                    </div>
                    <div>
                      <span className="font-medium">Start Date:</span>{" "}
                      {new Date(med.startDate).toLocaleDateString()}
                    </div>
                    {med.endDate && (
                      <div>
                        <span className="font-medium">End Date:</span>{" "}
                        {new Date(med.endDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {med.prescribedFor && (
                    <div className="text-sm">
                      <span className="font-medium">Prescribed For:</span> {med.prescribedFor}
                    </div>
                  )}

                  {med.effectiveness && (
                    <div className="text-sm">
                      <span className="font-medium">Effectiveness:</span> {med.effectiveness}/10
                    </div>
                  )}

                  {med.sideEffects && (
                    <div className="text-sm">
                      <span className="font-medium">Side Effects:</span> {med.sideEffects}
                    </div>
                  )}

                  {med.notes && (
                    <div className="text-sm text-muted-foreground">
                      {med.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
