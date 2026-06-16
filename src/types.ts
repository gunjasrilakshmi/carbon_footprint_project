export type CarbonCategory = "transport" | "food" | "utilities" | "shopping";

export interface CarbonEntry {
  id: string;
  date: string; // YYYY-MM-DD
  category: CarbonCategory;
  value: number; // raw value input
  unit: string; // km, meals, kWh, USD, etc.
  carbonEmissions: number; // in kg CO2e
  label: string; // e.g., "Commute - Solo Drive"
  details?: string; // extra metadata
}

export interface HabitAction {
  id: string;
  title: string;
  description: string;
  category: CarbonCategory;
  potentialSavings: number; // in kg CO2e saved per completion
  committed: boolean;
  progressCount: number;
  lastCompletedDate?: string; // YYYY-MM-DD
}

export interface UserProfile {
  name: string;
  country: string;
  targetWeeklyFootprint: number; // in kg CO2e, default e.g. 100
  dietaryPreference: "none" | "vegetarian" | "vegan" | "pescatarian" | "high-meat";
  homeEnergySource: "grid-average" | "renewable" | "natural-gas" | "coal";
}

export interface InsightReport {
  timestamp: string;
  summary: string;
  strengths: string[];
  recommendations: {
    title: string;
    description: string;
    savingsEstimate: string;
    category: CarbonCategory;
  }[];
  isAiGenerated: boolean;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "advisor";
  text: string;
  timestamp: string;
}
