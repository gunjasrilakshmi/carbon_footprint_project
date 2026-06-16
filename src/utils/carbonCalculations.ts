import { CarbonCategory } from "../types";

// Carbon emission factors in kg CO2e per unit of consumption

export const EMISSION_FACTORS = {
  transport: {
    gasCarSolo: 0.22, // per km
    gasCarShared: 0.11, // per km
    electricVehicle: 0.06, // per km
    bus: 0.08, // per km
    trainSubway: 0.04, // per km
    shortFlight: 0.18, // per km
    longFlight: 0.13, // per km
    activeTravel: 0.0, // walk/bike
  },
  food: {
    veganMeal: 0.60, // per meal
    vegetarianMeal: 1.10, // per meal
    poultryFishMeal: 2.20, // per meal
    porkMeal: 3.50, // per meal
    beefLambMeal: 6.80, // per meal
  },
  utilities: {
    electricityGrid: 0.42, // per kWh
    electricityEco: 0.03, // per kWh
    naturalGas: 0.19, // per kWh
    heatingOil: 0.27, // per kWh
  },
  shopping: {
    clothesNew: 12.0, // per item
    clothesSecondhand: 1.2, // per item
    electronicsNew: 75.0, // per major gadget
    generalSpentUSD: 0.35, // per USD spent
  },
};

/**
 * Calculates emissions for a specific category activity logs
 */
export function calculateEmissions(
  category: CarbonCategory,
  type: string,
  value: number
): number {
  if (value < 0) return 0;
  
  const factors = EMISSION_FACTORS[category] as Record<string, number>;
  const factor = factors[type] ?? 0;
  return Number((value * factor).toFixed(2));
}

/**
 * Friendly translations of CO2 masses to physical objects/activities for educational value
 */
export function getEmissionEquivalents(kgCO2: number): {
  smartphoneCharges: number;
  carKm: number;
  treeDays: number;
  hotShowers: number;
} {
  return {
    smartphoneCharges: Math.round(kgCO2 * 121.6), // 1 kg CO2e is approx 121.6 smartphone charge cycles
    carKm: Math.round(kgCO2 / 0.22), // average car drives 4.5 km per kg CO2e
    treeDays: Math.round(kgCO2 / (22 / 365)), // 1 tree absorbs ~22 kg CO2e per year, approx 0.06 kg per day
    hotShowers: Math.round(kgCO2 / 1.5), // average hot shower is ~1.5 kg CO2e
  };
}

/**
 * Default Habit Goals list
 */
export const DEFAULT_HABIT_ACTIONS = [
  {
    id: "habit_1",
    title: "Eco-Friendly Commute",
    description: "Take public transit, walk, bike, or carpool instead of driving solo.",
    category: "transport" as CarbonCategory,
    potentialSavings: 3.5, // saves 3.5kg CO2e per commute
    committed: false,
    progressCount: 0,
  },
  {
    id: "habit_2",
    title: "Vegetarian or Vegan Day",
    description: "Go meat-free for an entire day.",
    category: "food" as CarbonCategory,
    potentialSavings: 5.8, // saves 5.8kg CO2e per day
    committed: false,
    progressCount: 0,
  },
  {
    id: "habit_3",
    title: "Cold Water Laundry",
    description: "Wash your clothes using a cold cycle.",
    category: "utilities" as CarbonCategory,
    potentialSavings: 0.5,
    committed: false,
    progressCount: 0,
  },
  {
    id: "habit_4",
    title: "Turn Down Heating/Cooling",
    description: "Adjust thermostat by 2 degrees (lower in winter, higher in summer).",
    category: "utilities" as CarbonCategory,
    potentialSavings: 1.8,
    committed: false,
    progressCount: 0,
  },
  {
    id: "habit_5",
    title: "Thrift First",
    description: "Buy items secondhand instead of new items.",
    category: "shopping" as CarbonCategory,
    potentialSavings: 10.8,
    committed: false,
    progressCount: 0,
  },
  {
    id: "habit_6",
    title: "Zero Waste Food Day",
    description: "Ensure no food leftovers expire or go to landfill.",
    category: "food" as CarbonCategory,
    potentialSavings: 1.2,
    committed: false,
    progressCount: 0,
  },
];
