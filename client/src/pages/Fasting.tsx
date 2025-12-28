import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Clock, Plus, ArrowLeft, CheckCircle2, XCircle, Info } from "lucide-react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";

export default function Fasting() {
  const [, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [fastingType, setFastingType] = useState<"adf" | "tre" | "wdf">("tre");
  const [eatingWindowStart, setEatingWindowStart] = useState(12); // noon
  const [eatingWindowEnd, setEatingWindowEnd] = useState(20); // 8pm
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 3]); // Monday, Wednesday

  const utils = trpc.useUtils();
  const { data: activeSchedule } = trpc.fasting.getActive.useQuery();
  const { data: logs } = trpc.fasting.getLogs.useQuery(
    { scheduleId: activeSchedule?.id || 0 },
    { enabled: !!activeSchedule }
  );

  const createSchedule = trpc.fasting.create.useMutation({
    onSuccess: () => {
      toast.success("Fasting schedule created!");
      utils.fasting.getActive.invalidate();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to create schedule: " + error.message);
    },
  });

  const logAdherence = trpc.fasting.logAdherence.useMutation({
    onSuccess: () => {
      toast.success("Adherence logged!");
      utils.fasting.getLogs.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to log adherence: " + error.message);
    },
  });

  const handleCreateSchedule = () => {
    const scheduleData: any = {
      fastingType,
      startDate: new Date(),
    };

    if (fastingType === "tre") {
      scheduleData.eatingWindowStart = eatingWindowStart;
      scheduleData.eatingWindowEnd = eatingWindowEnd;
    } else if (fastingType === "wdf") {
      scheduleData.fastingDays = JSON.stringify(selectedDays);
    }

    createSchedule.mutate(scheduleData);
  };

  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day].sort());
    }
  };

  const getWeekDays = () => {
    const start = startOfWeek(new Date(), { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const hasLoggedToday = () => {
    if (!logs) return false;
    return logs.some((log) => isSameDay(new Date(log.date), new Date()));
  };

  const handleLogToday = (adhered: boolean) => {
    if (!activeSchedule) return;
    logAdherence.mutate({
      scheduleId: activeSchedule.id,
      date: new Date(),
      adhered,
    });
  };

  const getAdherenceRate = () => {
    if (!logs || logs.length === 0) return 0;
    const adheredCount = logs.filter((log) => log.adhered).length;
    return Math.round((adheredCount / logs.length) * 100);
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
              <Clock className="h-8 w-8 text-blue-600" />
              Intermittent Fasting Coach
            </h1>
            <p className="text-muted-foreground">Track your fasting schedule and adherence</p>
          </div>
          {!activeSchedule && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Start Fasting
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Choose Your Fasting Protocol</DialogTitle>
                  <DialogDescription>
                    Select the intermittent fasting method that fits your lifestyle
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <RadioGroup value={fastingType} onValueChange={(value) => setFastingType(value as any)}>
                    <div className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="tre" id="tre" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="tre" className="font-semibold cursor-pointer">
                          Time-Restricted Eating (TRE)
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Eat within a specific window each day (e.g., 12pm-8pm). Most popular and easiest to maintain.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="adf" id="adf" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="adf" className="font-semibold cursor-pointer">
                          Alternate Day Fasting (ADF)
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Alternate between fasting days and eating days. Most effective for weight loss per research.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="wdf" id="wdf" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="wdf" className="font-semibold cursor-pointer">
                          Whole Day Fasting (WDF)
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Fast for 1-2 full days per week (e.g., 5:2 diet). Flexible and sustainable.
                        </p>
                      </div>
                    </div>
                  </RadioGroup>

                  {fastingType === "tre" && (
                    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                      <Label>Eating Window</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="windowStart" className="text-sm">Start Time</Label>
                          <select
                            id="windowStart"
                            value={eatingWindowStart}
                            onChange={(e) => setEatingWindowStart(parseInt(e.target.value))}
                            className="w-full p-2 border rounded-md"
                          >
                            {Array.from({ length: 24 }, (_, i) => (
                              <option key={i} value={i}>
                                {i === 0 ? "12 AM" : i < 12 ? `${i} AM` : i === 12 ? "12 PM" : `${i - 12} PM`}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="windowEnd" className="text-sm">End Time</Label>
                          <select
                            id="windowEnd"
                            value={eatingWindowEnd}
                            onChange={(e) => setEatingWindowEnd(parseInt(e.target.value))}
                            className="w-full p-2 border rounded-md"
                          >
                            {Array.from({ length: 24 }, (_, i) => (
                              <option key={i} value={i}>
                                {i === 0 ? "12 AM" : i < 12 ? `${i} AM` : i === 12 ? "12 PM" : `${i - 12} PM`}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Window duration: {Math.abs(eatingWindowEnd - eatingWindowStart)} hours
                      </p>
                    </div>
                  )}

                  {fastingType === "wdf" && (
                    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                      <Label>Fasting Days</Label>
                      <div className="grid grid-cols-7 gap-2">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                          <Button
                            key={index}
                            type="button"
                            variant={selectedDays.includes(index) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleDay(index)}
                            className="w-full"
                          >
                            {day}
                          </Button>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Selected: {selectedDays.length} day(s) per week
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateSchedule} disabled={createSchedule.isPending}>
                      {createSchedule.isPending ? "Creating..." : "Start Fasting"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Info Card */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="h-5 w-5" />
              Research-Backed Benefits
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>
              A 2025 BMJ meta-analysis of 99 clinical trials confirmed that intermittent fasting is as effective 
              as traditional calorie restriction for weight loss, with Alternate Day Fasting showing slightly 
              superior results for improving cholesterol and triglycerides.
            </p>
          </CardContent>
        </Card>

        {activeSchedule ? (
          <div className="space-y-6">
            {/* Current Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>Your Active Schedule</CardTitle>
                <CardDescription>
                  {activeSchedule.fastingType === "tre" && "Time-Restricted Eating"}
                  {activeSchedule.fastingType === "adf" && "Alternate Day Fasting"}
                  {activeSchedule.fastingType === "wdf" && "Whole Day Fasting"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeSchedule.fastingType === "tre" && (
                  <div>
                    <p className="text-sm text-muted-foreground">Eating Window:</p>
                    <p className="text-lg font-semibold">
                      {activeSchedule.eatingWindowStart === 0 ? "12 AM" : 
                       activeSchedule.eatingWindowStart! < 12 ? `${activeSchedule.eatingWindowStart} AM` : 
                       activeSchedule.eatingWindowStart === 12 ? "12 PM" : 
                       `${activeSchedule.eatingWindowStart! - 12} PM`}
                      {" - "}
                      {activeSchedule.eatingWindowEnd === 0 ? "12 AM" : 
                       activeSchedule.eatingWindowEnd! < 12 ? `${activeSchedule.eatingWindowEnd} AM` : 
                       activeSchedule.eatingWindowEnd === 12 ? "12 PM" : 
                       `${activeSchedule.eatingWindowEnd! - 12} PM`}
                    </p>
                  </div>
                )}
                {activeSchedule.fastingType === "wdf" && activeSchedule.fastingDays && (
                  <div>
                    <p className="text-sm text-muted-foreground">Fasting Days:</p>
                    <p className="text-lg font-semibold">
                      {JSON.parse(activeSchedule.fastingDays).map((day: number) => 
                        ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day]
                      ).join(", ")}
                    </p>
                  </div>
                )}
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground mb-2">Adherence Rate:</p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-muted rounded-full h-3">
                      <div
                        className="bg-primary h-3 rounded-full transition-all"
                        style={{ width: `${getAdherenceRate()}%` }}
                      />
                    </div>
                    <span className="text-2xl font-bold">{getAdherenceRate()}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Today's Log */}
            {!hasLoggedToday() && (
              <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle>Did you stick to your fasting schedule today?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Button
                      onClick={() => handleLogToday(true)}
                      disabled={logAdherence.isPending}
                      className="flex-1"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Yes, I did!
                    </Button>
                    <Button
                      onClick={() => handleLogToday(false)}
                      disabled={logAdherence.isPending}
                      variant="outline"
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Not today
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Weekly Overview */}
            <Card>
              <CardHeader>
                <CardTitle>This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {getWeekDays().map((day, index) => {
                    const log = logs?.find((l) => isSameDay(new Date(l.date), day));
                    return (
                      <div
                        key={index}
                        className={`p-3 rounded-lg text-center border ${
                          log?.adhered
                            ? "bg-green-50 border-green-200"
                            : log && !log.adhered
                            ? "bg-red-50 border-red-200"
                            : "bg-muted"
                        }`}
                      >
                        <div className="text-xs text-muted-foreground mb-1">
                          {format(day, "EEE")}
                        </div>
                        <div className="text-lg font-semibold">{format(day, "d")}</div>
                        {log && (
                          <div className="mt-1">
                            {log.adhered ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600 mx-auto" />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No active fasting schedule</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Start Your Fasting Journey
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
