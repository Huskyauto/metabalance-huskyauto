import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';

interface FastingSession {
  id: number;
  type: '24hr' | '3-5day' | '7-10day';
  targetDuration: number;
  actualDuration: number | null;
  startTime: Date;
  endTime: Date | null;
  weightBefore: string | number | null;
  weightAfter: string | number | null;
  electrolytesLog: string | null;
  notes: string | null;
  userId: number;
  createdAt: Date;
}

const FASTING_PROTOCOLS = {
  '24hr': {
    name: '24-Hour Fast',
    duration: 24,
    description: 'Complete 24-hour fast with water and electrolytes',
    benefits: ['Autophagy initiation', 'Metabolic flexibility', 'Cellular repair'],
    electrolytes: 'Sodium, Potassium, Magnesium',
    warning: 'Ensure proper hydration and electrolyte balance',
  },
  '3-5day': {
    name: '3-5 Day Fast',
    duration: 72,
    description: 'Extended fast for deeper metabolic reset',
    benefits: ['Deep autophagy', 'Metabolic reset', 'Significant weight loss'],
    electrolytes: 'Essential - Sodium 500mg, Potassium 200mg, Magnesium 100mg daily',
    warning: 'Requires careful electrolyte management. Break fast gently with bone broth.',
  },
  '7-10day': {
    name: '7-10 Day Fast',
    duration: 168,
    description: 'Advanced protocol for experienced fasters',
    benefits: ['Maximum autophagy', 'Complete metabolic reset', 'Significant transformation'],
    electrolytes: 'Critical - Follow electrolyte protocol closely',
    warning: 'CRITICAL: Refeeding syndrome risk. Break fast with liquid foods only. Consult healthcare provider.',
  },
};

export function FastingProtocolTracker() {
  const [sessions, setSessions] = useState<FastingSession[]>([]);
  const [activeSession, setActiveSession] = useState<FastingSession | null>(null);
  const [selectedProtocol, setSelectedProtocol] = useState<'24hr' | '3-5day' | '7-10day'>('24hr');
  const [elapsedTime, setElapsedTime] = useState(0);

  const getActiveQuery = trpc.journeyFasting.getActive.useQuery();
  const getHistoryQuery = trpc.journeyFasting.getHistory.useQuery({ limit: 10 });
  const startSessionMutation = trpc.journeyFasting.startSession.useMutation();
  const endSessionMutation = trpc.journeyFasting.endSession.useMutation();

  useEffect(() => {
    if (getActiveQuery.data) {
      setActiveSession(getActiveQuery.data as any);
    }
  }, [getActiveQuery.data]);

  useEffect(() => {
    if (getHistoryQuery.data) {
      setSessions(getHistoryQuery.data as any);
    }
  }, [getHistoryQuery.data]);

  // Update elapsed time every second
  useEffect(() => {
    if (!activeSession) return;

    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(activeSession.startTime);
      const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  const handleStartFast = async () => {
    try {
      const result = await startSessionMutation.mutateAsync({
        type: selectedProtocol,
        targetDuration: FASTING_PROTOCOLS[selectedProtocol].duration,
      });
      setActiveSession(result as any);
    } catch (error) {
      console.error('Failed to start fasting session', error);
    }
  };

  const handleEndFast = async () => {
    if (!activeSession) return;

    try {
      await endSessionMutation.mutateAsync({
        sessionId: activeSession.id,
        notes: 'Fast completed',
      });
      setActiveSession(null);
      setElapsedTime(0);
      getHistoryQuery.refetch();
    } catch (error) {
      console.error('Failed to end fasting session', error);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const protocol = FASTING_PROTOCOLS[selectedProtocol];

  return (
    <div className="space-y-6">
      {/* Active Session */}
      {activeSession ? (
        <Card className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
          <CardHeader>
            <CardTitle>Active Fasting Session</CardTitle>
            <CardDescription>
              {FASTING_PROTOCOLS[activeSession.type].name} in progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Timer */}
            <div className="text-center space-y-4">
              <div className="text-6xl font-bold font-mono text-blue-600 dark:text-blue-400">
                {formatTime(elapsedTime)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Target: {formatTime(activeSession.targetDuration * 3600)}
              </p>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round((elapsedTime / (activeSession.targetDuration * 3600)) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-blue-600 dark:bg-blue-400 h-3 rounded-full transition-all"
                  style={{
                    width: `${Math.min((elapsedTime / (activeSession.targetDuration * 3600)) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Electrolyte Reminder */}
            <div className="p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg border border-yellow-300 dark:border-yellow-700">
              <p className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">💧 Electrolyte Reminder</p>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                {FASTING_PROTOCOLS[activeSession.type].electrolytes}
              </p>
            </div>

            {/* End Button */}
            <Button
              onClick={handleEndFast}
              variant="destructive"
              className="w-full"
              size="lg"
            >
              End Fasting Session
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Start Fasting Protocol</CardTitle>
            <CardDescription>Choose your fasting protocol</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Protocol Selection */}
            <div className="space-y-3">
              {Object.entries(FASTING_PROTOCOLS).map(([key, proto]) => (
                <div
                  key={key}
                  onClick={() => setSelectedProtocol(key as any)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedProtocol === key
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{proto.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{proto.description}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {proto.benefits.map((benefit, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{proto.duration}h</p>
                      <p className="text-xs text-gray-500">duration</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Warning */}
            <div className="p-4 bg-red-100 dark:bg-red-900 rounded-lg border border-red-300 dark:border-red-700">
              <p className="font-semibold text-red-900 dark:text-red-100 mb-2">⚠️ Important</p>
              <p className="text-sm text-red-800 dark:text-red-200">
                {FASTING_PROTOCOLS[selectedProtocol].warning}
              </p>
            </div>

            {/* Start Button */}
            <Button
              onClick={handleStartFast}
              className="w-full"
              size="lg"
              disabled={startSessionMutation.isPending}
            >
              {startSessionMutation.isPending ? 'Starting...' : 'Start Fasting Session'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Fasting History */}
      <Card>
        <CardHeader>
          <CardTitle>Fasting History</CardTitle>
          <CardDescription>Your recent fasting sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-sm text-gray-500">No fasting sessions yet. Start your first fast above!</p>
          ) : (
            <div className="space-y-3">
              {sessions.map(session => (
                <div key={session.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{FASTING_PROTOCOLS[session.type].name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(session.startTime).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {session.actualDuration ? formatTime(session.actualDuration * 3600) : 'In Progress'}
                      </p>
                      {session.weightBefore && session.weightAfter && (
                        <p className="text-sm text-green-600 dark:text-green-400">
                          -{(parseFloat(session.weightBefore as any) - parseFloat(session.weightAfter as any)).toFixed(1)} lbs
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
