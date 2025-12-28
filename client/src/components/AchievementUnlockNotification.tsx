import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import confetti from "canvas-confetti";

export function AchievementUnlockNotification() {
  const [showDialog, setShowDialog] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<any>(null);
  const [queue, setQueue] = useState<any[]>([]);

  const { data: user } = trpc.auth.me.useQuery(undefined, {
    retry: false,
  });

  const { data: unviewedAchievements } = trpc.achievements.getUnviewed.useQuery(undefined, {
    refetchInterval: 30000,
    enabled: !!user,
  });

  const markViewed = trpc.achievements.markViewed.useMutation();

  // Update queue when new unviewed achievements arrive
  useEffect(() => {
    if (unviewedAchievements && unviewedAchievements.length > 0) {
      setQueue(unviewedAchievements);
    }
  }, [unviewedAchievements]);

  // Show next achievement in queue
  useEffect(() => {
    if (queue.length > 0 && !showDialog) {
      const next = queue[0];
      setCurrentAchievement(next);
      setShowDialog(true);
      
      // Trigger confetti
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#FF6347', '#9370DB'],
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#FF6347', '#9370DB'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [queue, showDialog]);

  const handleClose = () => {
    if (currentAchievement) {
      // Mark as viewed
      markViewed.mutate({ achievementIds: [currentAchievement.achievementId] });
      
      // Remove from queue
      setQueue(prev => prev.slice(1));
      setShowDialog(false);
      setCurrentAchievement(null);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'from-amber-700 to-amber-900';
      case 'silver': return 'from-gray-400 to-gray-600';
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'platinum': return 'from-purple-400 to-purple-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  if (!currentAchievement?.definition) return null;

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Achievement Unlocked!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Achievement Badge */}
          <div className={`relative p-8 rounded-xl bg-gradient-to-br ${getTierColor(currentAchievement.definition.tier)} text-white text-center animate-in zoom-in duration-500`}>
            {/* Tier badge */}
            <div className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold bg-white/20">
              {currentAchievement.definition.tier.toUpperCase()}
            </div>
            
            {/* Icon */}
            <div className="text-7xl mb-4">
              {currentAchievement.definition.icon}
            </div>
            
            {/* Name */}
            <h3 className="text-2xl font-bold mb-2">
              {currentAchievement.definition.name}
            </h3>
            
            {/* Description */}
            <p className="text-white/90">
              {currentAchievement.definition.description}
            </p>
          </div>

          {/* Queue indicator */}
          {queue.length > 1 && (
            <p className="text-center text-sm text-muted-foreground">
              {queue.length - 1} more achievement{queue.length - 1 !== 1 ? 's' : ''} to view
            </p>
          )}

          {/* Close button */}
          <Button onClick={handleClose} className="w-full" size="lg">
            {queue.length > 1 ? 'Next Achievement' : 'Awesome!'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
