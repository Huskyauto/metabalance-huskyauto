import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Activity, Target, Heart, TrendingUp, Sparkles, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    setLocation("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="container py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            <span>Evidence-Based Weight Normalization</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Transform Your Metabolic Health with{" "}
            <span className="text-primary">MetaBalance</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A comprehensive platform combining the latest obesity research with personalized dietary guidance, 
            intermittent fasting coaching, and AI-powered insights to help you achieve lasting weight normalization.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild>
              <a href={getLoginUrl()}>Get Started</a>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8" asChild>
              <a href="#features">Learn More</a>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="container py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Science-Backed Approach</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Based on the latest research from Nature, BMJ, and leading universities
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Oil & Fat Analysis</h3>
            <p className="text-muted-foreground">
              Track and identify problematic oils high in linoleic acid (soybean, corn, sunflower) 
              that contribute to weight gain through oxylipin production.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Intermittent Fasting Coach</h3>
            <p className="text-muted-foreground">
              Choose from Alternate Day Fasting, Time-Restricted Eating, or Whole Day Fasting 
              protocols proven as effective as continuous calorie restriction.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Supplement Guidance</h3>
            <p className="text-muted-foreground">
              Evidence-based recommendations for berberine, probiotics, NMN, and resveratrol 
              to support metabolic health and cellular function.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-pink-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
            <p className="text-muted-foreground">
              Monitor weight, measurements, energy levels, and mood over time. 
              Understand your epigenetic memory and set realistic expectations.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-teal-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI-Powered Coaching</h3>
            <p className="text-muted-foreground">
              Get personalized daily insights, motivational messages, and instant answers 
              to your questions about nutrition and weight loss strategies.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Educational Resources</h3>
            <p className="text-muted-foreground">
              Learn about cellular energy, mitochondrial health, gut microbiome, 
              and the latest obesity research to make informed decisions.
            </p>
          </div>
        </div>
      </div>

      {/* Research-Backed Section */}
      <div className="bg-white py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Built on Cutting-Edge Research</h2>
            <p className="text-lg text-muted-foreground">
              MetaBalance integrates findings from 2024-2025 studies on epigenetic memory, 
              the role of dietary oils, intermittent fasting efficacy, and supplement benefits 
              for metabolic health.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <div className="px-4 py-2 bg-muted rounded-full text-sm font-medium">Nature 2024</div>
              <div className="px-4 py-2 bg-muted rounded-full text-sm font-medium">BMJ 2025</div>
              <div className="px-4 py-2 bg-muted rounded-full text-sm font-medium">Duke University</div>
              <div className="px-4 py-2 bg-muted rounded-full text-sm font-medium">UC Riverside</div>
              <div className="px-4 py-2 bg-muted rounded-full text-sm font-medium">Harvard Medical</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-6 bg-gradient-to-r from-primary/10 to-primary/5 p-12 rounded-2xl border border-primary/20">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Start Your Journey?</h2>
          <p className="text-lg text-muted-foreground">
            Join MetaBalance today and take control of your metabolic health with science-backed strategies.
          </p>
          <Button size="lg" className="text-lg px-8" asChild>
            <a href={getLoginUrl()}>Get Started Now</a>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; 2025 MetaBalance. Evidence-based weight normalization platform.</p>
        </div>
      </footer>
    </div>
  );
}
