import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, ArrowLeft, Lightbulb, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function Education() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      <div className="container py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-orange-600" />
              Education
            </h1>
            <p className="text-muted-foreground">Learn about metabolic health and evidence-based weight loss</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Understanding Obesity: Beyond Calories</CardTitle>
              <CardDescription>A metabolic and cellular perspective</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Traditional weight loss advice focuses on "calories in, calories out." While energy balance matters, 
                emerging research reveals that obesity is fundamentally a <strong>metabolic and cellular condition</strong> involving 
                mitochondrial dysfunction, inflammatory pathways, hormonal imbalances, and even epigenetic changes that make 
                weight loss difficult and weight regain common.
              </p>
              <p>
                This education section summarizes the latest scientific findings to help you understand <em>why</em> certain 
                dietary and lifestyle strategies work at the cellular level.
              </p>
            </CardContent>
          </Card>

          {/* Core Concepts Accordion */}
          <Card>
            <CardHeader>
              <CardTitle>Core Concepts</CardTitle>
              <CardDescription>Key scientific principles behind metabolic health</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="cellular-energy">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-600" />
                      <span>Cellular Energy & Mitochondrial Dysfunction</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="prose prose-sm max-w-none">
                    <p>
                      <strong>Mitochondria</strong> are the powerhouses of your cells, converting food into usable energy (ATP). 
                      In obesity, mitochondria become dysfunctional, leading to:
                    </p>
                    <ul>
                      <li><strong>Reductive stress:</strong> When cells have too much energy and can't burn it efficiently, 
                      electrons back up in the mitochondria, causing cellular damage</li>
                      <li><strong>Insulin resistance:</strong> Cells stop responding to insulin properly, leading to high blood 
                      sugar and increased fat storage</li>
                      <li><strong>Chronic inflammation:</strong> Damaged mitochondria release inflammatory signals that perpetuate 
                      metabolic dysfunction</li>
                    </ul>
                    <p>
                      <strong>Key insight:</strong> Obesity isn't just about storing too much fat—it's about cells that can't 
                      efficiently process energy. Fixing mitochondrial function is crucial for sustainable weight loss.
                    </p>
                    <p className="text-sm text-muted-foreground italic">
                      Source: Harvard T.H. Chan School of Public Health research on mitochondrial dysfunction in obesity (2024)
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="pufas">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <span>The PUFA Problem: Linoleic Acid & Obesity</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="prose prose-sm max-w-none">
                    <p>
                      <strong>Polyunsaturated fats (PUFAs)</strong>, particularly linoleic acid from seed oils (soybean, corn, 
                      sunflower), have increased dramatically in the modern diet—from 2% of calories in 1900 to over 8% today.
                    </p>
                    <p>
                      <strong>The problem:</strong>
                    </p>
                    <ul>
                      <li><strong>Omega-6 overload:</strong> The omega-6 to omega-3 ratio has shifted from 1:1 to 20:1 in modern 
                      diets, promoting inflammation</li>
                      <li><strong>Obesogenic effects:</strong> UC Riverside research (2025) found soybean oil consumption directly 
                      linked to obesity and metabolic dysfunction in animal models</li>
                      <li><strong>Oxidative damage:</strong> PUFAs are easily oxidized, creating harmful compounds that damage 
                      mitochondria and cell membranes</li>
                      <li><strong>Fat storage signals:</strong> High linoleic acid intake may signal the body to store more fat 
                      rather than burn it</li>
                    </ul>
                    <p>
                      <strong>Action step:</strong> Minimize consumption of seed oils. Choose olive oil, avocado oil, coconut oil, 
                      or butter instead. Read labels—soybean oil is in most processed foods.
                    </p>
                    <p className="text-sm text-muted-foreground italic">
                      Sources: UC Riverside study (2025), omega-6/omega-3 ratio research (PMC4808858)
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="epigenetic">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      <span>Epigenetic Memory: Why Weight Regain Happens</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="prose prose-sm max-w-none">
                    <p>
                      A groundbreaking 2024 Nature study discovered that <strong>fat cells "remember" obesity</strong> at the 
                      epigenetic level—even after weight loss.
                    </p>
                    <p>
                      <strong>What this means:</strong>
                    </p>
                    <ul>
                      <li>Fat cells retain molecular changes from obesity that make them prone to storing fat again</li>
                      <li>This "cellular memory" persists for years after weight loss</li>
                      <li>It explains why 80% of people regain lost weight within 5 years</li>
                      <li>The body actively fights to return to its previous higher weight</li>
                    </ul>
                    <p>
                      <strong>Implications:</strong> Weight loss is not a temporary project—it requires <em>permanent lifestyle 
                      changes</em> to overcome this epigenetic memory. Maintenance is as important as the initial weight loss.
                    </p>
                    <p>
                      <strong>Hope:</strong> While epigenetic memory is persistent, it can potentially be "rewritten" over time 
                      with sustained healthy behaviors. The longer you maintain weight loss, the easier it may become.
                    </p>
                    <p className="text-sm text-muted-foreground italic">
                      Source: Nature study on adipose tissue epigenetic memory (2024)
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="hormones">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-blue-600" />
                      <span>Hormonal Influences: Cortisol & Estrogen</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="prose prose-sm max-w-none">
                    <p>
                      Hormones play a crucial role in fat storage and metabolism:
                    </p>
                    <h4><strong>Cortisol (Stress Hormone):</strong></h4>
                    <ul>
                      <li>Chronic stress elevates cortisol, which promotes abdominal fat storage</li>
                      <li>Cortisol increases appetite and cravings for high-calorie foods</li>
                      <li>Disrupts sleep, which further worsens metabolic health</li>
                      <li><strong>Solution:</strong> Stress management (meditation, exercise, adequate sleep) is essential</li>
                    </ul>
                    <h4><strong>Estrogen:</strong></h4>
                    <ul>
                      <li>Fat tissue produces estrogen, creating a feedback loop that promotes more fat storage</li>
                      <li>Estrogen dominance (relative to progesterone) is linked to weight gain, especially in women</li>
                      <li>Menopause-related estrogen changes shift fat distribution to the abdomen</li>
                      <li><strong>Solution:</strong> Maintain healthy body composition, consider phytoestrogen balance in diet</li>
                    </ul>
                    <p className="text-sm text-muted-foreground italic">
                      Sources: Research on stress, cortisol and obesity (PMC5958156), estrogens in adipose tissue (PMC10045924)
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="fasting">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span>Intermittent Fasting: Metabolic Reset</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="prose prose-sm max-w-none">
                    <p>
                      <strong>Intermittent fasting (IF)</strong> isn't just about reducing calories—it triggers powerful metabolic 
                      changes:
                    </p>
                    <ul>
                      <li><strong>Autophagy:</strong> Fasting activates cellular "cleanup" processes that remove damaged 
                      mitochondria and proteins</li>
                      <li><strong>Insulin sensitivity:</strong> Extended fasting periods give insulin receptors a break, improving 
                      their responsiveness</li>
                      <li><strong>Fat burning:</strong> After 12-16 hours without food, the body shifts from burning glucose to 
                      burning fat (ketosis)</li>
                      <li><strong>Hormonal benefits:</strong> IF can improve leptin sensitivity (satiety hormone) and reduce 
                      inflammation</li>
                    </ul>
                    <p>
                      <strong>Evidence:</strong> A 2024 BMJ review found that time-restricted eating (16:8) and alternate-day 
                      fasting both produce significant weight loss and metabolic improvements.
                    </p>
                    <p>
                      <strong>Key insight:</strong> The <em>timing</em> of eating matters as much as <em>what</em> you eat. 
                      Giving your body extended breaks from food allows metabolic repair.
                    </p>
                    <p className="text-sm text-muted-foreground italic">
                      Source: BMJ systematic review on intermittent fasting (2024)
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="gut">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-teal-600" />
                      <span>Gut Microbiome & Metabolism</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="prose prose-sm max-w-none">
                    <p>
                      Your gut contains trillions of bacteria that influence metabolism, inflammation, and weight:
                    </p>
                    <ul>
                      <li><strong>Obesogenic bacteria:</strong> Certain bacterial strains extract more calories from food and 
                      promote fat storage</li>
                      <li><strong>Inflammation:</strong> An unhealthy gut microbiome ("dysbiosis") triggers systemic inflammation 
                      that worsens insulin resistance</li>
                      <li><strong>Appetite regulation:</strong> Gut bacteria produce signals that affect hunger and satiety</li>
                      <li><strong>Short-chain fatty acids:</strong> Beneficial bacteria ferment fiber into compounds that improve 
                      metabolic health</li>
                    </ul>
                    <p>
                      <strong>Action steps:</strong>
                    </p>
                    <ul>
                      <li>Eat diverse, fiber-rich foods (vegetables, fruits, whole grains, legumes)</li>
                      <li>Consider probiotic supplementation with multiple strains</li>
                      <li>Minimize antibiotics unless medically necessary</li>
                      <li>Avoid artificial sweeteners, which may harm gut bacteria</li>
                    </ul>
                    <p className="text-sm text-muted-foreground italic">
                      Source: Multiple studies on gut microbiome and obesity
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="nad">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-purple-600" />
                      <span>NAD+ & Cellular Aging</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="prose prose-sm max-w-none">
                    <p>
                      <strong>NAD+ (nicotinamide adenine dinucleotide)</strong> is a crucial molecule for cellular energy and repair:
                    </p>
                    <ul>
                      <li><strong>Declines with age:</strong> NAD+ levels drop by 50% between ages 20 and 60</li>
                      <li><strong>Mitochondrial function:</strong> NAD+ is essential for mitochondria to produce energy efficiently</li>
                      <li><strong>DNA repair:</strong> NAD+ activates sirtuins, proteins that repair DNA and regulate metabolism</li>
                      <li><strong>Metabolic health:</strong> Low NAD+ is linked to insulin resistance, obesity, and metabolic syndrome</li>
                    </ul>
                    <p>
                      <strong>Boosting NAD+:</strong>
                    </p>
                    <ul>
                      <li><strong>Exercise:</strong> Physical activity naturally increases NAD+ levels</li>
                      <li><strong>Fasting:</strong> Caloric restriction and intermittent fasting boost NAD+</li>
                      <li><strong>Supplements:</strong> NMN (nicotinamide mononucleotide) and NR (nicotinamide riboside) are NAD+ 
                      precursors</li>
                      <li><strong>Resveratrol:</strong> May enhance the effects of NAD+ by activating sirtuins</li>
                    </ul>
                    <p className="text-sm text-muted-foreground italic">
                      Source: Research on NAD+ and metabolic health
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Practical Action Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Putting It All Together: Your Action Plan</CardTitle>
              <CardDescription>Evidence-based strategies for sustainable weight normalization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">1. Dietary Foundation</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Eliminate seed oils:</strong> Avoid soybean, corn, sunflower, safflower oils</li>
                  <li><strong>Choose healthy fats:</strong> Olive oil, avocado oil, coconut oil, butter, ghee</li>
                  <li><strong>Increase omega-3:</strong> Fatty fish, walnuts, flaxseeds, or supplements</li>
                  <li><strong>Eat whole foods:</strong> Minimize ultra-processed foods</li>
                  <li><strong>Prioritize fiber:</strong> Vegetables, fruits, legumes, whole grains (for gut health)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">2. Timing & Fasting</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Start with 16:8:</strong> 16-hour fast, 8-hour eating window (e.g., noon to 8pm)</li>
                  <li><strong>Progress gradually:</strong> Consider alternate-day fasting or 5:2 diet if comfortable</li>
                  <li><strong>Stay hydrated:</strong> Water, black coffee, unsweetened tea during fasting</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">3. Lifestyle Factors</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Manage stress:</strong> Meditation, yoga, deep breathing, nature walks</li>
                  <li><strong>Prioritize sleep:</strong> 7-9 hours per night, consistent schedule</li>
                  <li><strong>Exercise regularly:</strong> Mix cardio and strength training (boosts NAD+, improves mitochondria)</li>
                  <li><strong>Build muscle:</strong> Muscle tissue is metabolically active and improves insulin sensitivity</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">4. Targeted Supplementation</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Consider berberine:</strong> For blood sugar control and AMPK activation</li>
                  <li><strong>Probiotics:</strong> Multi-strain formula for gut health</li>
                  <li><strong>Omega-3 (EPA/DHA):</strong> 1-2g daily to balance omega-6</li>
                  <li><strong>Vitamin D:</strong> If deficient (get tested)</li>
                  <li><strong>Magnesium:</strong> For insulin sensitivity and sleep</li>
                  <li><strong>NMN or NR:</strong> To boost NAD+ (optional, more research needed)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">5. Long-Term Mindset</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Think permanent:</strong> These aren't temporary diet changes—they're lifestyle shifts</li>
                  <li><strong>Expect plateaus:</strong> Weight loss isn't linear; focus on non-scale victories</li>
                  <li><strong>Combat epigenetic memory:</strong> Maintenance requires ongoing effort for years</li>
                  <li><strong>Track progress:</strong> Weight, measurements, energy, sleep, mood</li>
                  <li><strong>Seek support:</strong> Community, coaching, or medical guidance when needed</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                <strong>Medical Disclaimer:</strong> This educational content is based on current scientific research but is not 
                medical advice. Always consult with a healthcare provider before making significant dietary changes, starting 
                supplements, or beginning a new exercise program—especially if you have existing health conditions or take 
                medications.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
