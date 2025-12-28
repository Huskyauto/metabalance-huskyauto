import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, UserPlus, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export default function Login() {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();
  
  const { loginAsync, registerAsync, isLoggingIn, isRegistering } = useAuth();
  
  const isLoading = isLoggingIn || isRegistering;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      if (isRegisterMode) {
        await registerAsync({ email, password, name: name || undefined });
      } else {
        await loginAsync({ email, password });
      }
      setLocation("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-white p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-teal-600">
            {isRegisterMode ? "Create Account" : "Welcome to MetaBalance"}
          </CardTitle>
          <CardDescription>
            {isRegisterMode 
              ? "Sign up to start your metabolic health journey"
              : "Sign in to access your personalized metabolic health journey"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegisterMode && (
              <div className="space-y-2">
                <Label htmlFor="name">Name (optional)</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={isLoading}
              />
              {isRegisterMode && (
                <p className="text-xs text-muted-foreground">
                  Password must be at least 6 characters
                </p>
              )}
            </div>
            
            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-teal-600 hover:bg-teal-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isRegisterMode ? "Creating Account..." : "Signing In..."}
                </>
              ) : (
                <>
                  {isRegisterMode ? (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create Account
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </>
                  )}
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setError("");
              }}
              className="text-sm text-teal-600 hover:underline"
              disabled={isLoading}
            >
              {isRegisterMode 
                ? "Already have an account? Sign in"
                : "Don't have an account? Create one"
              }
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
