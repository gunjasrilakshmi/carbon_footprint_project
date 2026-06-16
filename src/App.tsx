import { useState, useEffect } from "react";
import { Leaf, Info, RefreshCw, Settings, Sparkles, Sliders, Trees, Check, ShieldAlert, BadgeInfo } from "lucide-react";
import { CarbonEntry, HabitAction, UserProfile } from "./types";
import { DEFAULT_HABIT_ACTIONS, getEmissionEquivalents } from "./utils/carbonCalculations";

import MetricCard from "./components/MetricCard";
import CarbonCharts from "./components/CarbonCharts";
import ActivityLogger from "./components/ActivityLogger";
import ActionTracker from "./components/ActionTracker";
import AiAdvisor from "./components/AiAdvisor";

// High-fidelity prepopulated sample data for immediate visual engagement
const SAMPLE_ENTRIES: CarbonEntry[] = [
  {
    id: "sample_1",
    date: new Date(Date.now() - 0 * 86400000).toISOString().split("T")[0], // Today
    category: "food",
    value: 1,
    unit: "meals",
    carbonEmissions: 1.10,
    label: "Vegetarian Lunch (Dairy/Eggs)",
  },
  {
    id: "sample_2",
    date: new Date(Date.now() - 0 * 86400000).toISOString().split("T")[0], // Today
    category: "transport",
    value: 15,
    unit: "km",
    carbonEmissions: 3.30,
    label: "Gasoline Car (Solo)",
  },
  {
    id: "sample_3",
    date: new Date(Date.now() - 1 * 86400000).toISOString().split("T")[0], // Yesterday
    category: "food",
    value: 1,
    unit: "meals",
    carbonEmissions: 6.80,
    label: "Beef steak Dinner",
  },
  {
    id: "sample_4",
    date: new Date(Date.now() - 1 * 86400000).toISOString().split("T")[0], // Yesterday
    category: "transport",
    value: 20,
    unit: "km",
    carbonEmissions: 0.80,
    label: "Train Subway Ride",
  },
  {
    id: "sample_5",
    date: new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0], // 2 Days Ago
    category: "utilities",
    value: 12,
    unit: "kWh",
    carbonEmissions: 5.04,
    label: "Electricity (Grid Average)",
  },
  {
    id: "sample_6",
    date: new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0], // 3 Days Ago
    category: "shopping",
    value: 1,
    unit: "items",
    carbonEmissions: 12.0,
    label: "New Brand Denim Jeans",
  },
  {
    id: "sample_7",
    date: new Date(Date.now() - 4 * 86400000).toISOString().split("T")[0], // 4 Days Ago
    category: "transport",
    value: 40,
    unit: "km",
    carbonEmissions: 8.80,
    label: "Gasoline Car (Solo) Long Commute",
  },
  {
    id: "sample_8",
    date: new Date(Date.now() - 5 * 86400000).toISOString().split("T")[0], // 5 Days Ago
    category: "food",
    value: 1,
    unit: "meals",
    carbonEmissions: 0.60,
    label: "Healthy Plant-Based (Vegan) Lunch",
  },
  {
    id: "sample_9",
    date: new Date(Date.now() - 6 * 86400000).toISOString().split("T")[0], // 6 Days Ago
    category: "utilities",
    value: 15,
    unit: "kWh",
    carbonEmissions: 6.30,
    label: "Grid electricity usage",
  },
];

export default function App() {
  const [entries, setEntries] = useState<CarbonEntry[]>(() => {
    const saved = localStorage.getItem("carbon_entries");
    return saved ? JSON.parse(saved) : SAMPLE_ENTRIES;
  });

  const [habits, setHabits] = useState<HabitAction[]>(() => {
    const saved = localStorage.getItem("carbon_habits");
    return saved ? JSON.parse(saved) : DEFAULT_HABIT_ACTIONS;
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("carbon_profile");
    if (saved) return JSON.parse(saved);
    return {
      name: "Eco Guardian",
      country: "US",
      targetWeeklyFootprint: 120, // default target is 120kg CO2e
      dietaryPreference: "none",
      homeEnergySource: "grid-average",
    };
  });

  const [showSettings, setShowSettings] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Save entries, habits, and profile to localStorage
  useEffect(() => {
    localStorage.setItem("carbon_entries", JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem("carbon_habits", JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem("carbon_profile", JSON.stringify(profile));
  }, [profile]);

  // Flash positive info message
  const triggerSuccessMsg = (msg: string) => {
    setSuccessMsg(msg);
    const timer = setTimeout(() => {
      setSuccessMsg("");
    }, 4005);
    return () => clearTimeout(timer);
  };

  // Add standard carbon entry
  const addEntry = (newEntry: CarbonEntry) => {
    setEntries((prev) => [newEntry, ...prev]);
    triggerSuccessMsg(`Successfully logged "${newEntry.label}" (+${newEntry.carbonEmissions} kg CO₂e)`);
  };

  // Delete standard entry
  const removeEntry = (id: string) => {
    setEntries((prev) => prev.filter((item) => item.id !== id));
    triggerSuccessMsg("Entry removed from ledger.");
  };

  // Toggle subscribing to habit goal
  const toggleCommit = (id: string) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, committed: !h.committed } : h))
    );
    const item = habits.find((h) => h.id === id);
    if (item) {
      triggerSuccessMsg(
        !item.committed
          ? `Subscribed to: "${item.title}" pledge!`
          : `Unlinked from: "${item.title}" pledge.`
      );
    }
  };

  // Action log completion (adds a carbon saving entry)
  const completeHabit = (id: string, savings: number) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id ? { ...h, progressCount: h.progressCount + 1 } : h
      )
    );

    const habit = habits.find((h) => h.id === id);
    if (!habit) return;

    // Create negative entry in ledger reflecting offset/savings
    const todayStr = new Date().toISOString().split("T")[0];
    const offsetEntry: CarbonEntry = {
      id: "saving_" + Math.random().toString(36).substring(2, 9),
      date: todayStr,
      category: habit.category,
      value: 1,
      unit: "pledge success",
      carbonEmissions: -savings, // negative footprint!
      label: `Carbon Saving: ${habit.title}`,
    };

    setEntries((prev) => [offsetEntry, ...prev]);
    triggerSuccessMsg(`Active target complete! Saved -${savings} kg CO₂e today!🌻`);
  };

  // Register custom user habit
  const addCustomHabit = (
    title: string,
    description: string,
    category: any,
    savings: number
  ) => {
    const newHabit: HabitAction = {
      id: "custom_habit_" + Math.random().toString(36).substring(2, 9),
      title,
      description,
      category,
      potentialSavings: savings,
      committed: true, // Auto pledge custom ones
      progressCount: 0,
    };

    setHabits((prev) => [newHabit, ...prev]);
    triggerSuccessMsg(`Created custom pledge: "${title}"`);
  };

  // Virtual Tree Planting Offset module
  const buyTreeOffset = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const treeOffsetEntry: CarbonEntry = {
      id: "offset_" + Math.random().toString(36).substring(2, 9),
      date: todayStr,
      category: "utilities",
      value: 1,
      unit: "tree planted",
      carbonEmissions: -15.0, // negative offset
      label: "🍀 Virtual Seedling Sponsored (Tree offset)",
    };

    setEntries((prev) => [treeOffsetEntry, ...prev]);
    triggerSuccessMsg("Virtual tree seedling sponsored! Deducted -15.0 kg CO₂e offset.");
  };

  const resetData = () => {
    if (confirm("Are you sure you want to restore defaults? This empties current logs.")) {
      setEntries(SAMPLE_ENTRIES);
      setHabits(DEFAULT_HABIT_ACTIONS);
      setProfile({
        name: "Eco Guardian",
        country: "US",
        targetWeeklyFootprint: 120,
        dietaryPreference: "none",
        homeEnergySource: "grid-average",
      });
      triggerSuccessMsg("Carbon log restored to standard baseline.");
    }
  };

  // Aggregate weekly statistics (past 7 days)
  const past7DaysEntries = entries.filter((e) => {
    const dateLimit = Date.now() - 7 * 86400000;
    return new Date(e.date + "T00:00:00").getTime() >= dateLimit;
  });

  const weeklyEmissions = Number(
    past7DaysEntries.reduce((total, e) => total + e.carbonEmissions, 0).toFixed(1)
  );

  const equivalents = getEmissionEquivalents(weeklyEmissions > 0 ? weeklyEmissions : 0);

  // Budget calculations
  const weeklyTarget = profile.targetWeeklyFootprint;
  const isOverBudget = weeklyEmissions > weeklyTarget;
  const budgetPercentage = Math.min(Math.round((weeklyEmissions / weeklyTarget) * 100), 100);

  return (
    <div className="min-h-screen bg-[#fafcfa] dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 selection:bg-emerald-500 selection:text-white transition-colors duration-300">
      
      {/* Outer Banner Alert / Message Notification */}
      {successMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-zinc-900 border border-zinc-850 dark:bg-white text-white dark:text-zinc-900 text-xs px-4 py-3 rounded-xl shadow-lg font-medium animate-fade-in transition-all">
          <Leaf className="w-3.5 h-3.5 text-emerald-400 dark:text-[#065f46] fill-emerald-400 dark:fill-[#065f46] animate-pulse" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Container Header */}
      <header className="border-b border-[#edf2ed] dark:border-zinc-900 bg-white dark:bg-zinc-900/50 backdrop-blur-md sticky top-0 z-30 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#065f46] text-white flex items-center justify-center shadow-sm">
              <Leaf className="w-5 h-5 fill-emerald-100 text-emerald-100" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                Carbon Footprint Tracker
                <span className="text-[9px] bg-[#e6f4ea] dark:bg-emerald-950/50 text-[#065f46] dark:text-emerald-400 border border-[#edf2ed] dark:border-emerald-900/30 font-bold px-2 py-0.5 rounded-full uppercase">
                  Advisor
                </span>
              </h1>
              <p className="text-xs text-zinc-450 dark:text-zinc-500 mt-1">
                Sustainably log carbon behavior, commit to ecology pledges, and summon custom AI insights
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Target Budget Setting toggle */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="px-3 py-1.5 h-9 text-xs font-bold border border-[#edf2ed] dark:border-zinc-800 hover:bg-[#fafcfa] rounded-xl text-zinc-750 dark:text-zinc-200 bg-white dark:bg-zinc-900 inline-flex items-center gap-2 transition-all cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-zinc-400" />
              Settings
            </button>

            {/* Quick Default reset */}
            <button
              onClick={resetData}
              className="px-3 py-1.5 h-9 text-xs font-bold bg-[#fafcfa] dark:bg-zinc-900 text-zinc-500 hover:text-rose-600 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 border border-[#edf2ed] dark:border-zinc-800 rounded-xl inline-flex items-center gap-1.5 transition-all cursor-pointer"
              title="Reset defaults"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Restore Defaults
            </button>

            {/* Developer Email Badge */}
            <span className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 h-9 text-[10px] font-bold bg-zinc-100/40 dark:bg-zinc-950/60 border border-zinc-205 dark:border-zinc-800/40 text-zinc-450 rounded-xl uppercase tracking-wider">
              Email: gunjasrilakshmi4@gmail.com
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Settings Collapsible Drawer */}
        {showSettings && (
          <div className="bg-white dark:bg-zinc-900 border border-[#edf2ed] dark:border-zinc-800/80 rounded-[20px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.015)] transition-all animate-fade-in">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#edf2ed] dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                Customize Target Footprint & Profile factors
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-xs text-zinc-400 hover:text-zinc-700 font-bold cursor-pointer"
              >
                Close Settings
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs text-zinc-700 dark:text-zinc-300">
              
              {/* Slider for target emissions */}
              <div className="md:col-span-2">
                <label className="block text-[9px] uppercase font-bold tracking-wider text-zinc-400 mb-1.5">
                  Target Weekly Carbon Limit: <span className="text-zinc-950 dark:text-zinc-200 font-bold text-xs">{profile.targetWeeklyFootprint} kg CO₂e</span>
                </label>
                <input
                  type="range"
                  min="20"
                  max="400"
                  value={profile.targetWeeklyFootprint}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      targetWeeklyFootprint: parseInt(e.target.value),
                    }))
                  }
                  className="w-full accent-[#065f46] bg-[#f4f7f4] dark:bg-zinc-800 rounded-lg cursor-pointer my-2"
                />
                <span className="text-[10px] text-zinc-450 block mt-1 font-medium">
                  Global average footprint target is currently ~85 kg CO2e per week. Select your personal target.
                </span>
              </div>

              {/* Dietary Preferences list */}
              <div>
                <label className="block text-[9px] uppercase font-bold tracking-wider text-zinc-400 mb-1.5">
                  Dietary Preferences
                </label>
                <select
                  value={profile.dietaryPreference}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      dietaryPreference: e.target.value as any,
                    }))
                  }
                  className="w-full h-9 px-3 border border-[#edf2ed] dark:border-zinc-800 bg-[#fbfdfb] dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="none">Standard Diet</option>
                  <option value="high-meat">High Daily Meat Diet</option>
                  <option value="pescatarian">Pescatarian (Fish only)</option>
                  <option value="vegetarian">Vegetarian (Dairy/Eggs)</option>
                  <option value="vegan">Fully Vegan (Plant-Based)</option>
                </select>
              </div>

              {/* Home power sources */}
              <div>
                <label className="block text-[9px] uppercase font-bold tracking-wider text-zinc-400 mb-1.5">
                  Primary Home Power Source
                </label>
                <select
                  value={profile.homeEnergySource}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      homeEnergySource: e.target.value as any,
                    }))
                  }
                  className="w-full h-9 px-3 border border-[#edf2ed] dark:border-zinc-800 bg-[#fbfdfb] dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="grid-average">Standard Grid Power</option>
                  <option value="renewable">100% Renewable Tariff</option>
                  <option value="natural-gas">Natural Gas Cogeneration</option>
                  <option value="coal">Coal Generator Dominated Grid</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 1. Core Summary Metrics Bar (Grid row) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Logged (Past 7 Days)"
            value={weeklyEmissions > 0 ? weeklyEmissions.toFixed(1) : 0}
            unit="kg CO₂e"
            colorClass={isOverBudget ? "border-rose-300 dark:border-rose-900/50 bg-rose-50/10" : "border-[#edf2ed] bg-white"}
            subtitle={`Goal: ${weeklyTarget} kg Limit max`}
            icon={<Leaf className="w-4 h-4 text-emerald-600" />}
            trend={{
              direction: isOverBudget ? "up" : "down",
              text: isOverBudget ? "Over Target Limit" : "Inside Plan",
            }}
          />

          <MetricCard
            title="Tree Absorption Days"
            value={weeklyEmissions > 0 ? equivalents.treeDays : 0}
            unit="Tree-Days"
            subtitle="Absorption period required for 1 mature pine tree"
            icon={<Trees className="w-4 h-4 text-[#065f46]" />}
          />

          <MetricCard
            title="Smartphone Charges"
            value={weeklyEmissions > 0 ? equivalents.smartphoneCharges.toLocaleString() : 0}
            unit="Cycles"
            subtitle="Equal to plugging in standard phones"
            icon={<Info className="w-4 h-4 text-blue-500" />}
          />

          {/* Virtual tree Sponsor offset action! */}
          <div className="rounded-[20px] border border-[#edf2ed] dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 flex flex-col justify-between h-full shadow-[0_4px_12px_rgba(0,0,0,0.015)]">
            <div>
              <span className="text-[9px] uppercase font-bold text-emerald-700 dark:text-emerald-400 tracking-wider">
                Reduce & Offset Emissions
              </span>
              <h3 className="text-xs font-bold text-zinc-850 dark:text-zinc-200 mt-1">
                Virtual reforestation offset
              </h3>
              <p className="text-[11px] text-zinc-500 mt-1.5 leading-relaxed">
                Sponsor a local fast-growing structural tree sapling to immediately offset **15.0 kg of CO₂e** from your journal.
              </p>
            </div>
            <button
              onClick={buyTreeOffset}
              className="mt-4 w-full py-2 bg-[#065f46] hover:bg-[#044e39] text-white font-bold text-xs rounded-xl transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trees className="w-3.5 h-3.5" />
              Sponsor Tree Offset (-15 kg)
            </button>
          </div>
        </div>

        {/* 2. Target Gauge & Progress indicator */}
        <div className="bg-white dark:bg-zinc-900 border border-[#edf2ed] dark:border-zinc-800 rounded-[20px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.015)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <BadgeInfo className="w-4 h-4 text-emerald-600" />
                Carbon Budget Intake Status
              </h3>
              <p className="text-xs text-zinc-450 dark:text-zinc-500 mt-1">
                Daily carbon budgets help individuals target individual sustainability milestones.
              </p>
            </div>
            
            <div className="text-right">
              <span className="text-xs font-semibold text-zinc-400">Intake Level:</span>
              <span className={`text-base font-bold ml-1.5 ${isOverBudget ? "text-rose-500" : "text-[#065f46] dark:text-emerald-400"}`}>
                {weeklyEmissions > 0 ? ((weeklyEmissions / weeklyTarget) * 100).toFixed(0) : 0}% of weekly budget
              </span>
            </div>
          </div>

          <div className="w-full bg-[#f4f7f4] dark:bg-zinc-950 rounded-full h-3.5 mt-5 overflow-hidden border border-[#edf2ed] dark:border-zinc-850">
            <div
              style={{ width: `${budgetPercentage}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                isOverBudget
                  ? "bg-rose-400"
                  : budgetPercentage > 80
                  ? "bg-amber-400"
                  : "bg-[#065f46]"
              }`}
            />
          </div>
          
          <div className="flex justify-between items-center text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-2.5">
            <span>0 kg (Zero-Emissions baseline)</span>
            <span>Budget Ceiling: {weeklyTarget} kg</span>
          </div>
        </div>

        {/* 3. Analytical Carbon Data Visuals */}
        <section>
          <CarbonCharts entries={entries} targetWeeklyLimit={weeklyTarget} />
        </section>

        {/* 4. Active Log behaviors & Historic Journal list */}
        <section>
          <ActivityLogger
            onAddEntry={addEntry}
            recentEntries={entries}
            onRemoveEntry={removeEntry}
          />
        </section>

        {/* 5. Custom Habit Challenges Pledge list & AI Sustainability Coach */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <ActionTracker
            habits={habits}
            onToggleCommit={toggleCommit}
            onCompleteHabit={completeHabit}
            onAddCustomHabit={addCustomHabit}
          />

          <AiAdvisor
            entries={entries}
            habits={habits}
            userProfile={profile}
          />
        </div>

      </main>

      {/* Sustainable footer guidelines */}
      <footer className="border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950 mt-14 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <div className="flex items-center gap-1.5">
            <Leaf className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
            <span className="font-bold text-zinc-700 dark:text-zinc-300">
              Carbon Footprint Tracker &amp; Co.
            </span>
          </div>
          <p className="text-center md:text-right font-medium">
            Calculations are guided by Greenhouse Gas protocol emissions factors (GHG) and IPCC estimates.
          </p>
        </div>
      </footer>
    </div>
  );
}
