import { getDb } from "./db";
import { journeySupplements } from "../drizzle/schema";

const supplementsData = [
  // Phase 1: Foundation Supplements
  {
    name: "Electrolyte Complex",
    dosage: "1000-2000mg sodium daily",
    frequency: "daily",
    monthlyCost: "30.00",
    category: "foundation" as const,
    phaseIntroduced: 1,
    benefits: "Hydration, muscle function, prevents cramping during fasting",
    brands: "LMNT, Nuun, Ultima Replenisher",
  },
  {
    name: "Magnesium Glycinate",
    dosage: "300-400mg daily",
    frequency: "daily",
    monthlyCost: "20.00",
    category: "foundation" as const,
    phaseIntroduced: 1,
    benefits: "Sleep quality, stress reduction, muscle relaxation",
    brands: "Thorne, NOW Foods, Doctor's Best",
  },
  {
    name: "B-Complex Vitamin",
    dosage: "1 capsule daily",
    frequency: "daily",
    monthlyCost: "16.00",
    category: "foundation" as const,
    phaseIntroduced: 1,
    benefits: "Energy production, metabolism support, nervous system health",
    brands: "Thorne, Jarrow Formulas, Garden of Life",
  },
  {
    name: "Vitamin D3",
    dosage: "2000-4000 IU daily",
    frequency: "daily",
    monthlyCost: "12.00",
    category: "foundation" as const,
    phaseIntroduced: 1,
    benefits: "Immune function, mood support, bone health",
    brands: "Nature Made, Thorne, Nordic Naturals",
  },
  
  // Phase 2: Advanced Supplements
  {
    name: "Ashwagandha",
    dosage: "300-600mg daily",
    frequency: "daily",
    monthlyCost: "18.00",
    category: "advanced" as const,
    phaseIntroduced: 2,
    benefits: "Cortisol reduction, stress management, hormonal balance",
    brands: "KSM-66, Gaia Herbs, Organic India",
  },
  {
    name: "Rhodiola Rosea",
    dosage: "200mg daily",
    frequency: "daily",
    monthlyCost: "22.00",
    category: "advanced" as const,
    phaseIntroduced: 2,
    benefits: "Adaptogenic support, energy, mental clarity during fasting",
    brands: "NOW Foods, Gaia Herbs, Nature's Way",
  },
  {
    name: "Lactobacillus gasseri",
    dosage: "500mg-1 billion CFU daily",
    frequency: "daily",
    monthlyCost: "35.00",
    category: "advanced" as const,
    phaseIntroduced: 2,
    benefits: "Weight loss support, gut health, metabolic optimization",
    brands: "Culturelle, Garden of Life, Jarrow Formulas",
  },
  {
    name: "Bifidobacterium lactis B420",
    dosage: "1-2 billion CFU daily",
    frequency: "daily",
    monthlyCost: "35.00",
    category: "advanced" as const,
    phaseIntroduced: 2,
    benefits: "Body composition improvement, gut barrier integrity",
    brands: "Thorne, Klaire Labs, VSL#3",
  },
  {
    name: "Omega-3 Fish Oil",
    dosage: "2-3g EPA/DHA daily",
    frequency: "daily",
    monthlyCost: "20.00",
    category: "advanced" as const,
    phaseIntroduced: 2,
    benefits: "Inflammation reduction, heart health, brain function",
    brands: "Nordic Naturals, Carlson Labs, Thorne",
  },
  {
    name: "Capsinoids",
    dosage: "6-12mg daily",
    frequency: "daily",
    monthlyCost: "20.00",
    category: "advanced" as const,
    phaseIntroduced: 2,
    benefits: "Brown fat activation, metabolic boost (5-10%), thermogenesis",
    brands: "Capsimax, NOW Foods, Jarrow Formulas",
  },
  
  // Phase 3: Deep Optimization Supplements
  {
    name: "L-Glutamine",
    dosage: "5-10g daily",
    frequency: "daily",
    monthlyCost: "20.00",
    category: "advanced" as const,
    phaseIntroduced: 3,
    benefits: "Gut barrier repair, intestinal health, reduced inflammation",
    brands: "Thorne, NOW Foods, Jarrow Formulas",
  },
  {
    name: "Collagen Peptides",
    dosage: "10-20g daily",
    frequency: "daily",
    monthlyCost: "25.00",
    category: "advanced" as const,
    phaseIntroduced: 3,
    benefits: "Gut lining support, skin health, joint health",
    brands: "Vital Proteins, Sports Research, Ancient Nutrition",
  },
  {
    name: "L-Theanine",
    dosage: "100-200mg as needed",
    frequency: "as-needed",
    monthlyCost: "15.00",
    category: "optional" as const,
    phaseIntroduced: 3,
    benefits: "Stress reduction during extended fasts, mental clarity",
    brands: "Thorne, NOW Foods, Jarrow Formulas",
  },
  
  // Optional/Situational Supplements
  {
    name: "Berberine",
    dosage: "500mg 2-3x daily",
    frequency: "daily",
    monthlyCost: "25.00",
    category: "optional" as const,
    phaseIntroduced: 1,
    benefits: "Blood sugar regulation, insulin sensitivity, metabolic support",
    brands: "Thorne, Integrative Therapeutics, NOW Foods",
  },
  {
    name: "NMN (Nicotinamide Mononucleotide)",
    dosage: "250-500mg daily",
    frequency: "daily",
    monthlyCost: "45.00",
    category: "optional" as const,
    phaseIntroduced: 2,
    benefits: "NAD+ boost, cellular energy, metabolic health",
    brands: "ProHealth, Tru Niagen, Elysium Health",
  },
  {
    name: "Resveratrol",
    dosage: "250-500mg daily",
    frequency: "daily",
    monthlyCost: "30.00",
    category: "optional" as const,
    phaseIntroduced: 2,
    benefits: "Longevity support, antioxidant, metabolic enhancement",
    brands: "Thorne, Life Extension, NOW Foods",
  },
];

async function seedSupplements() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    process.exit(1);
  }
  
  try {
    console.log("Seeding journey supplements...");
    
    await db.insert(journeySupplements).values(supplementsData);
    
    console.log(`✅ Successfully seeded ${supplementsData.length} supplements`);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding supplements:", error);
    process.exit(1);
  }
}

seedSupplements();
