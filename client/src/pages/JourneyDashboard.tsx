import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { trpc } from '@/lib/trpc';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

interface Phase {
  id: number;
  userId: number;
  phaseNumber: number;
  phaseName: string;
  startDate: Date;
  endDate: Date | null;
  goalWeightLoss: string;
  actualWeightLoss: string | null;
  status: string;
  createdAt: Date;
}

const PHASE_DESCRIPTIONS: Record<number, string> = {
  1: 'Foundation & Metabolic Reset - Establish baseline, introduce supplements, learn fasting protocols',
  2: 'Acceleration & Advanced Protocols - Increase fasting duration, add advanced supplements, optimize nutrition',
  3: 'Deep Optimization & Metabolic Reset - Extended fasts, metabolic reset, advanced supplementation',
  4: 'Maintenance & Consolidation - Stabilize weight, maintain gains, transition to long-term lifestyle',
};

export function JourneyDashboard() {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [currentPhase, setCurrentPhase] = useState<Phase | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  const getAllPhasesQuery = trpc.journey.getAllPhases.useQuery();
  const getCurrentPhaseQuery = trpc.journey.getCurrentPhase.useQuery();
  const profileQuery = trpc.profile.get.useQuery();
  
  const initializeJourneyMutation = trpc.journey.initializePhases.useMutation({
    onSuccess: () => {
      getAllPhasesQuery.refetch();
      getCurrentPhaseQuery.refetch();
    },
  });
  
  const resetJourneyMutation = trpc.journey.resetJourney.useMutation({
    onSuccess: () => {
      getAllPhasesQuery.refetch();
      getCurrentPhaseQuery.refetch();
    },
  });

  const handleStartJourney = async () => {
    if (!profileQuery.data?.currentWeight || !profileQuery.data?.targetWeight) {
      alert('Please set your current weight and target weight in your profile first.');
      return;
    }
    
    await initializeJourneyMutation.mutateAsync({
      startWeight: profileQuery.data.currentWeight,
      targetWeight: profileQuery.data.targetWeight,
    });
  };

  useEffect(() => {
    if (getAllPhasesQuery.data) {
      setPhases(getAllPhasesQuery.data);
    }
    if (getCurrentPhaseQuery.data) {
      setCurrentPhase(getCurrentPhaseQuery.data);
    }
    setLoading(false);
  }, [getAllPhasesQuery.data, getCurrentPhaseQuery.data]);

  if (loading) {
    return <div className="text-center py-8">Loading journey phases...</div>;
  }

  if (!phases.length) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => setLocation('/dashboard')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Journey Not Started</CardTitle>
            <CardDescription>Initialize your 90lb Journey to get started</CardDescription>
          </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            The 90lb Journey is a 12-month, 4-phase program designed to safely and sustainably achieve significant weight loss through evidence-based protocols.
          </p>
          <Button 
            onClick={handleStartJourney}
            disabled={initializeJourneyMutation.isPending}
          >
            {initializeJourneyMutation.isPending ? 'Initializing...' : 'Start My Journey'}
          </Button>
        </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => setLocation('/dashboard')}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Button>
      {/* Current Phase Overview */}
      {currentPhase && (
        <Card className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">
                  Phase {currentPhase.phaseNumber}: {currentPhase.phaseName}
                </CardTitle>
                <CardDescription className="mt-2">
                  {PHASE_DESCRIPTIONS[currentPhase.phaseNumber]}
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {currentPhase.phaseNumber}/4
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Timeline */}
            <div className="space-y-2">
              <p className="text-sm font-semibold">Timeline</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentPhase.startDate instanceof Date ? currentPhase.startDate.toLocaleDateString() : new Date(currentPhase.startDate).toLocaleDateString()} - {currentPhase.endDate instanceof Date ? currentPhase.endDate.toLocaleDateString() : currentPhase.endDate ? new Date(currentPhase.endDate).toLocaleDateString() : 'TBD'}
              </p>
            </div>

            {/* Weight Loss Progress */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold">Weight Loss Progress</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentPhase.actualWeightLoss} / {currentPhase.goalWeightLoss} lbs
                </p>
              </div>
              <Progress
                value={currentPhase.actualWeightLoss ? (parseFloat(currentPhase.actualWeightLoss) / parseFloat(currentPhase.goalWeightLoss)) * 100 : 0}
                className="h-3"
              />
            </div>

            {/* Days Elapsed */}
            <div className="space-y-2">
              <p className="text-sm font-semibold">Days in Phase</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {Math.floor((Date.now() - new Date(currentPhase.startDate).getTime()) / (1000 * 60 * 60 * 24))} / 90 days
              </p>
              <Progress
                value={(Math.floor((Date.now() - new Date(currentPhase.startDate).getTime()) / (1000 * 60 * 60 * 24)) / 90) * 100}
                className="h-3"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Phases Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>12-Month Journey Timeline</CardTitle>
              <CardDescription>Track your progress through all 4 phases</CardDescription>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950">
                  Reset Journey
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset Your Journey?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your journey data including phases, supplement logs, fasting sessions, and blood work results. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => resetJourneyMutation.mutate()}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {resetJourneyMutation.isPending ? 'Resetting...' : 'Reset Journey'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {phases.map((phase, index) => {
              const isActive = phase.id === currentPhase?.id;
              const isCompleted = phase.endDate ? new Date() > (phase.endDate instanceof Date ? phase.endDate : new Date(phase.endDate)) : false;

              return (
                <div key={phase.id} className="flex gap-4">
                  {/* Timeline Indicator */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        isActive
                          ? 'bg-blue-500 text-white'
                          : isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {phase.phaseNumber}
                    </div>
                    {index < phases.length - 1 && (
                      <div
                        className={`w-1 h-12 ${
                          isCompleted ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      />
                    )}
                  </div>

                  {/* Phase Details */}
                  <div className="flex-1 pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">
                          Phase {phase.phaseNumber}: {phase.phaseName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {phase.startDate instanceof Date ? phase.startDate.toLocaleDateString() : new Date(phase.startDate).toLocaleDateString()} - {phase.endDate instanceof Date ? phase.endDate.toLocaleDateString() : phase.endDate ? new Date(phase.endDate).toLocaleDateString() : 'TBD'}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          isActive
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : isCompleted
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {isActive ? 'Current' : isCompleted ? 'Completed' : 'Upcoming'}
                      </span>
                    </div>

                    {/* Weight Loss Goal */}
                    <div className="space-y-1">
                      <p className="text-sm">
                        Goal: <span className="font-semibold">{phase.goalWeightLoss} lbs</span>
                        {isCompleted && phase.actualWeightLoss && (
                          <span className="ml-2 text-green-600 dark:text-green-400">
                            Actual: {phase.actualWeightLoss} lbs
                          </span>
                        )}
                      </p>
                      {(isActive || isCompleted) && phase.actualWeightLoss && (
                        <Progress
                          value={(parseFloat(phase.actualWeightLoss) / parseFloat(phase.goalWeightLoss)) * 100}
                          className="h-2"
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Phase Guidance */}
      {currentPhase && (
        <Card>
          <CardHeader>
            <CardTitle>Phase {currentPhase.phaseNumber} Guidance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentPhase.phaseNumber === 1 && (
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold mb-1">✓ Foundation Supplements</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Start with electrolytes, magnesium, B-complex, and Vitamin D3
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">✓ Fasting Protocol</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Begin with 16:8 intermittent fasting, progress to 24-hour fasts
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">✓ Nutrition Focus</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    750 cal/day deficit, high protein (1g per lb), whole foods
                  </p>
                </div>
              </div>
            )}
            {currentPhase.phaseNumber === 2 && (
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold mb-1">✓ Advanced Supplements</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add Ashwagandha, Rhodiola, probiotics, Omega-3, Capsinoids
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">✓ Extended Fasting</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Progress to 3-5 day fasts with electrolyte management
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">✓ Metabolic Optimization</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Increase activity, add resistance training, optimize sleep
                  </p>
                </div>
              </div>
            )}
            {currentPhase.phaseNumber === 3 && (
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold mb-1">✓ Deep Optimization</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add L-Glutamine, collagen, advanced protocols
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">✓ Extended Protocols</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    7-10 day fasts with proper refeeding, metabolic reset
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">✓ Blood Work Tracking</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Monitor A1C, lipids, liver enzymes, metabolic markers
                  </p>
                </div>
              </div>
            )}
            {currentPhase.phaseNumber === 4 && (
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold mb-1">✓ Maintenance Focus</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Transition to maintenance calories, continue supplements
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">✓ Consolidation</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Establish long-term habits, reduce fasting frequency
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">✓ Final Assessment</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Complete final blood work, celebrate transformation
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
