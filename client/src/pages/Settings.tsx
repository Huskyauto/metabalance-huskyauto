import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { NotificationSettings } from "@/components/NotificationSettings";
import { useTheme } from "@/contexts/ThemeContext";

export default function Settings() {
  const [, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/dashboard")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your preferences and notifications
          </p>
        </div>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize how MetaBalance looks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === "dark" ? (
                  <Moon className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Sun className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <Label htmlFor="theme-toggle" className="text-base">
                    Dark Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {theme === "dark" ? "Dark theme enabled" : "Light theme enabled"}
                  </p>
                </div>
              </div>
              <Switch
                id="theme-toggle"
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <NotificationSettings />

        {/* Future settings sections can be added here */}
      </div>
    </div>
  );
}
