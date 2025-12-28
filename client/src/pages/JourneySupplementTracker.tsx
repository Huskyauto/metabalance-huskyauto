import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { trpc } from '@/lib/trpc';


interface Supplement {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  category: string;
  phaseIntroduced: number;
  monthlyCost: string | null;
  taken?: boolean;
}

export function JourneySupplementTracker() {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [today, setToday] = useState(new Date());


  const getAllSupplementsQuery = trpc.journeySupplements.getAll.useQuery();
  const getLogForDateQuery = trpc.journeySupplements.getLogForDate.useQuery({ date: today });
  const logIntakeMutation = trpc.journeySupplements.logIntake.useMutation();
  const getCurrentPhaseQuery = trpc.journey.getCurrentPhase.useQuery();

  useEffect(() => {
    if (getAllSupplementsQuery.data) {
      setSupplements(getAllSupplementsQuery.data);
    }
  }, [getAllSupplementsQuery.data]);

  useEffect(() => {
    if (getCurrentPhaseQuery.data) {
      setCurrentPhase(getCurrentPhaseQuery.data.phaseNumber);
    }
  }, [getCurrentPhaseQuery.data]);

  useEffect(() => {
    if (getLogForDateQuery.data) {
      const loggedIds = getLogForDateQuery.data.map(log => log.supplementId);
      setSupplements(prev =>
        prev.map(supp => ({
          ...supp,
          taken: loggedIds.includes(supp.id),
        }))
      );
    }
  }, [getLogForDateQuery.data]);

  const handleToggleSupplement = async (supplement: Supplement) => {
    try {
      await logIntakeMutation.mutateAsync({
        supplementId: supplement.id,
        date: today,
        taken: !supplement.taken,
      });

      setSupplements(prev =>
        prev.map(s => (s.id === supplement.id ? { ...s, taken: !s.taken } : s))
      );

      console.log(`${supplement.name} ${supplement.taken ? 'removed from' : 'added to'} today's log`);
    } catch (error) {
      console.error('Failed to log supplement', error);
    }
  };

  const categorizedSupplements = supplements.reduce(
    (acc, supp) => {
      if (!acc[supp.category]) {
        acc[supp.category] = [];
      }
      acc[supp.category].push(supp);
      return acc;
    },
    {} as Record<string, Supplement[]>
  );

  const takenCount = supplements.filter(s => s.taken).length;
  const totalCount = supplements.length;
  const monthlyCost = supplements.reduce((sum, s) => sum + (parseFloat(s.monthlyCost || '0')), 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Today's Supplements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{takenCount}/{totalCount}</div>
            <p className="text-xs text-gray-500 mt-1">supplements taken</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Current Phase</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{currentPhase}</div>
            <p className="text-xs text-gray-500 mt-1">of 4 phases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${monthlyCost.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">estimated monthly</p>
          </CardContent>
        </Card>
      </div>

      {/* Supplements by Category */}
      <div className="space-y-4">
        {Object.entries(categorizedSupplements).map(([category, supps]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-lg capitalize">{category} Supplements</CardTitle>
              <CardDescription>
                {supps.filter(s => s.phaseIntroduced <= currentPhase).length} of {supps.length} available in Phase {currentPhase}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {supps.map(supp => {
                const isAvailable = supp.phaseIntroduced <= currentPhase;
                return (
                  <div
                    key={supp.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      isAvailable
                        ? 'bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800'
                        : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-60'
                    }`}
                  >
                    <Checkbox
                      checked={supp.taken || false}
                      onCheckedChange={() => handleToggleSupplement(supp)}
                      disabled={!isAvailable}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className={`font-semibold ${supp.taken ? 'line-through text-gray-400' : ''}`}>
                            {supp.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {supp.dosage} - {supp.frequency}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                            ${parseFloat(supp.monthlyCost || '0').toFixed(2)}/mo
                          </p>
                          {!isAvailable && (
                            <p className="text-xs text-gray-500">Phase {supp.phaseIntroduced}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Information */}
      <Card>
        <CardHeader>
          <CardTitle>Supplement Strategy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <strong>Phase 1:</strong> Foundation supplements establish baseline health and prepare your body for fasting protocols.
          </p>
          <p>
            <strong>Phase 2:</strong> Advanced supplements are introduced to optimize metabolism and support extended fasting.
          </p>
          <p>
            <strong>Phase 3:</strong> Deep optimization supplements support metabolic reset and extended protocols.
          </p>
          <p>
            <strong>Phase 4:</strong> Maintenance supplements help consolidate gains and transition to long-term lifestyle.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
