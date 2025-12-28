import { useState, useEffect } from "react";
import { Bell, Clock, TrendingUp, Award, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

export function NotificationSettings() {
  const { data: profile, isLoading } = trpc.profile.get.useQuery();
  const updateProfile = trpc.profile.upsert.useMutation();
  const [saved, setSaved] = useState(false);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dailyReminderTime, setDailyReminderTime] = useState("09:00");
  const [streakAlertsEnabled, setStreakAlertsEnabled] = useState(true);
  const [milestoneAlertsEnabled, setMilestoneAlertsEnabled] = useState(true);

  // Load current settings from profile
  useEffect(() => {
    if (profile) {
      setNotificationsEnabled(profile.notificationsEnabled ?? true);
      setDailyReminderTime(profile.dailyReminderTime || "09:00");
      setStreakAlertsEnabled(profile.streakAlertsEnabled ?? true);
      setMilestoneAlertsEnabled(profile.milestoneAlertsEnabled ?? true);
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        notificationsEnabled,
        dailyReminderTime,
        streakAlertsEnabled,
        milestoneAlertsEnabled,
      } as any); // Type will be fixed when router is updated

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      alert("Failed to save notification settings. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>Loading your notification preferences...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Manage when and how you receive reminders and updates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Master Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notifications-enabled" className="text-base font-medium">
              Enable Notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              Receive push notifications for reminders and achievements
            </p>
          </div>
          <Switch
            id="notifications-enabled"
            checked={notificationsEnabled}
            onCheckedChange={setNotificationsEnabled}
          />
        </div>

        <div className="border-t pt-6 space-y-4">
          {/* Daily Reminder Time */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-600" />
              <Label htmlFor="reminder-time" className="text-base font-medium">
                Daily Reminder Time
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Get a daily reminder to log your meals and track your goals
            </p>
            <input
              type="time"
              id="reminder-time"
              value={dailyReminderTime}
              onChange={(e) => setDailyReminderTime(e.target.value)}
              disabled={!notificationsEnabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Streak Alerts */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <Label htmlFor="streak-alerts" className="text-base font-medium">
                  Streak Alerts
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Get notified when your streak is at risk or when you hit new records
              </p>
            </div>
            <Switch
              id="streak-alerts"
              checked={streakAlertsEnabled}
              onCheckedChange={setStreakAlertsEnabled}
              disabled={!notificationsEnabled}
            />
          </div>

          {/* Milestone Alerts */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-600" />
                <Label htmlFor="milestone-alerts" className="text-base font-medium">
                  Milestone Celebrations
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Celebrate achievements like 7-day streaks, weight loss milestones, and more
              </p>
            </div>
            <Switch
              id="milestone-alerts"
              checked={milestoneAlertsEnabled}
              onCheckedChange={setMilestoneAlertsEnabled}
              disabled={!notificationsEnabled}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <Button
            onClick={handleSave}
            disabled={updateProfile.isPending}
            className="w-full"
          >
            {updateProfile.isPending ? (
              "Saving..."
            ) : saved ? (
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Saved!
              </span>
            ) : (
              "Save Notification Settings"
            )}
          </Button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Notifications are delivered through the Manus platform.
            Make sure your browser allows notifications from this site.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
