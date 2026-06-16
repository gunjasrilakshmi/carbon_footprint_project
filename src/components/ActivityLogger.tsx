import { useState, FormEvent } from "react";
import { Plus, Flame, Car, Leaf, Footprints, ShoppingBag, Zap, Calendar, Trash2 } from "lucide-react";
import { CarbonCategory, CarbonEntry } from "../types";
import { calculateEmissions, EMISSION_FACTORS } from "../utils/carbonCalculations";

interface ActivityLoggerProps {
  onAddEntry: (entry: CarbonEntry) => void;
  recentEntries: CarbonEntry[];
  onRemoveEntry: (id: string) => void;
}

export default function ActivityLogger({ onAddEntry, recentEntries, onRemoveEntry }: ActivityLoggerProps) {
  const [activeTab, setActiveTab] = useState<CarbonCategory>("transport");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [customValue, setCustomValue] = useState<string>("");
  const [customType, setCustomType] = useState<string>("");
  
  // Specific formulas and names
  const options = {
    transport: [
      { type: "gasCarSolo", name: "Gasoline Car (Solo)", unit: "km", defaultVal: "15" },
      { type: "gasCarShared", name: "Gasoline Car (Carpool)", unit: "km", defaultVal: "15" },
      { type: "electricVehicle", name: "Electric Vehicle (EV)", unit: "km", defaultVal: "15" },
      { type: "bus", name: "Public Bus Route", unit: "km", defaultVal: "10" },
      { type: "trainSubway", name: "Train / Subway Ride", unit: "km", defaultVal: "20" },
      { type: "shortFlight", name: "Flight (Short Haul)", unit: "km", defaultVal: "500" },
      { type: "longFlight", name: "Flight (Long Haul)", unit: "km", defaultVal: "3000" },
    ],
    food: [
      { type: "beefLambMeal", name: "Beef or Lamb Meal", unit: "meals", defaultVal: "1" },
      { type: "porkMeal", name: "Pork / Pork Products", unit: "meals", defaultVal: "1" },
      { type: "poultryFishMeal", name: "Chicken, Fish, or Poultry", unit: "meals", defaultVal: "1" },
      { type: "vegetarianMeal", name: "Vegetarian Meal (Eggs/Dairy)", unit: "meals", defaultVal: "1" },
      { type: "veganMeal", name: "Fully Plant-Based (Vegan) Meal", unit: "meals", defaultVal: "1" },
    ],
    utilities: [
      { type: "electricityGrid", name: "Electricity (Grid Average)", unit: "kWh", defaultVal: "10" },
      { type: "electricityEco", name: "Electricity (Green/Renewable)", unit: "kWh", defaultVal: "10" },
      { type: "naturalGas", name: "Natural Gas Heating/Stove", unit: "kWh", defaultVal: "15" },
      { type: "heatingOil", name: "Heating Oil Furnace", unit: "kWh", defaultVal: "15" },
    ],
    shopping: [
      { type: "clothesNew", name: "Brand New Apparel / Shoe", unit: "items", defaultVal: "1" },
      { type: "clothesSecondhand", name: "Secondhand / Thrifted Item", unit: "items", defaultVal: "1" },
      { type: "electronicsNew", name: "New Electronic Gadget", unit: "items", defaultVal: "1" },
      { type: "generalSpentUSD", name: "General Goods (USD Spent)", unit: "USD", defaultVal: "50" },
    ],
  };

  // Set default form select type when tab changes
  useState(() => {
    setCustomType(options.transport[0].type);
  });

  const handleTabChange = (tab: CarbonCategory) => {
    setActiveTab(tab);
    setCustomType(options[tab][0].type);
    setCustomValue("");
  };

  const handleQuickLog = (type: string, name: string, unit: string, defaultString: string) => {
    const numericVal = parseFloat(defaultString) || 1;
    const co2 = calculateEmissions(activeTab, type, numericVal);
    
    const newEntry: CarbonEntry = {
      id: "entry_" + Math.random().toString(36).substring(2, 9),
      date,
      category: activeTab,
      value: numericVal,
      unit,
      carbonEmissions: co2,
      label: name,
    };

    onAddEntry(newEntry);
  };

  const handleCustomSubmit = (e: FormEvent) => {
    e.preventDefault();
    const val = parseFloat(customValue);
    if (isNaN(val) || val <= 0) return;

    const opt = options[activeTab].find((o) => o.type === customType);
    if (!opt) return;

    const co2 = calculateEmissions(activeTab, customType, val);
    const newEntry: CarbonEntry = {
      id: "entry_" + Math.random().toString(36).substring(2, 9),
      date,
      category: activeTab,
      value: val,
      unit: opt.unit,
      carbonEmissions: co2,
      label: opt.name,
    };

    onAddEntry(newEntry);
    setCustomValue("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Logger Panel */}
      <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-[#edf2ed] dark:border-zinc-800/80 rounded-[20px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.015)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Flame className="w-4 h-4 text-emerald-500 fill-emerald-500" />
              Impact Ledger
            </h3>
            <p className="text-xs text-zinc-450 dark:text-zinc-500 mt-1">
              Log daily activities or consumption to update your real-time carbon dashboard
            </p>
          </div>

          {/* Date Selector */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-[#edf2ed] dark:border-zinc-800 bg-[#fbfdfb] dark:bg-zinc-950 rounded-xl">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-xs font-semibold bg-transparent border-none text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Category Navigation Bar */}
        <div className="flex gap-1.5 p-1 bg-[#f4f7f4] dark:bg-zinc-950 rounded-xl mb-6 overflow-x-auto">
          {(["transport", "food", "utilities", "shopping"] as CarbonCategory[]).map((tab) => {
            const isActive = activeTab === tab;
            let icon = <Car className="w-3.5 h-3.5" />;
            let label = "Transit";
            if (tab === "food") {
              icon = <Leaf className="w-3.5 h-3.5" />;
              label = "Food";
            } else if (tab === "utilities") {
              icon = <Zap className="w-3.5 h-3.5" />;
              label = "Utilities";
            } else if (tab === "shopping") {
              icon = <ShoppingBag className="w-3.5 h-3.5" />;
              label = "Shopping";
            }

            return (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`flex-1 min-w-[80px] inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                  isActive
                    ? "bg-white dark:bg-zinc-900 text-[#065f46] dark:text-emerald-400 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                    : "text-zinc-500 hover:text-[#10b981] dark:hover:text-zinc-300"
                }`}
              >
                {icon}
                {label}
              </button>
            );
          })}
        </div>

        {/* Quick Log Presets Grid */}
        <div className="mb-6">
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-500 block mb-3">
            Quick Logging Shortcuts
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {options[activeTab].map((opt) => {
              // Match approximate multiplier for display
              const sampleVal = parseFloat(opt.defaultVal);
              const sampleCO2 = calculateEmissions(activeTab, opt.type, sampleVal);

              return (
                <button
                  key={opt.type}
                  onClick={() => handleQuickLog(opt.type, opt.name, opt.unit, opt.defaultVal)}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-[#edf2ed] dark:border-zinc-800/80 bg-[#fafcfa]/40 hover:bg-[#e6f4ea]/40 dark:bg-zinc-900/40 dark:hover:bg-emerald-950/10 hover:border-emerald-500/20 group text-left transition-all"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-zinc-850 dark:text-zinc-200 group-hover:text-[#065f46] dark:group-hover:text-emerald-400 theme-transition">
                      {opt.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 font-medium">
                      + {opt.defaultVal} {opt.unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-zinc-650 dark:text-zinc-300 group-hover:text-[#065f46] dark:group-hover:text-emerald-400">
                      ~{sampleCO2} kg
                    </span>
                    <div className="w-5 h-5 rounded-full bg-[#f4f7f4] dark:bg-zinc-800 flex items-center justify-center group-hover:bg-[#10b981] group-hover:text-white dark:group-hover:bg-[#065f46] transition-colors">
                      <Plus className="w-3 h-3 text-zinc-500 group-hover:text-white" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Exact Value Form */}
        <form onSubmit={handleCustomSubmit} className="border-t border-[#edf2ed] dark:border-zinc-800/60 pt-5 mt-5">
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-500 block mb-3">
            Log precise custom value
          </span>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <select
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                className="w-full h-10 px-3 py-2 text-xs font-medium border border-[#edf2ed] dark:border-zinc-805 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              >
                {options[activeTab].map((o) => (
                  <option key={o.type} value={o.type}>
                    {o.name} ({o.unit})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2 min-w-[150px]">
              <input
                type="number"
                step="any"
                placeholder={`Value (${options[activeTab].find((o) => o.type === customType)?.unit || ""})`}
                required
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                className="w-full h-10 px-3 py-2 text-xs border border-[#edf2ed] dark:border-zinc-805 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="h-10 px-5 text-sm font-semibold rounded-xl bg-[#065f46] text-white hover:bg-[#044e39] transition-colors inline-flex items-center justify-center gap-2"
            >
              Add Log Entry
            </button>
          </div>
        </form>
      </div>

      {/* Recent History Sidebar */}
      <div className="bg-white dark:bg-zinc-900 border border-[#edf2ed] dark:border-zinc-800/80 rounded-[20px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.015)] flex flex-col justify-between h-full min-h-[460px]">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Footprints className="w-4 h-4 text-emerald-600" />
            Recent Carbon History
          </h3>
          <p className="text-xs text-zinc-450 dark:text-zinc-500 mt-1">
            Overview of recently logged activities
          </p>
          
          <div className="mt-4 space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {recentEntries.length === 0 ? (
              <div className="text-center py-10 px-4 text-xs text-zinc-400 bg-zinc-50/50 dark:bg-zinc-950/40 rounded-xl border border-dashed border-[#edf2ed] dark:border-zinc-800/60 font-medium">
                Your ecological journal is empty. Log something to begin your eco-journey!
              </div>
            ) : (
              recentEntries.slice(0, 8).map((entry) => {
                let badgeColor = "bg-blue-50/50 text-blue-600 border-blue-100/60 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30";
                if (entry.category === "food") {
                  badgeColor = "bg-emerald-50/50 text-emerald-600 border-emerald-100/60 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30";
                } else if (entry.category === "utilities") {
                  badgeColor = "bg-amber-50/60 text-amber-600 border-amber-100/60 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30";
                } else if (entry.category === "shopping") {
                  badgeColor = "bg-purple-50/60 text-purple-600 border-purple-100/60 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30";
                }

                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-[#edf2ed]/65 dark:border-zinc-800/40 bg-zinc-50/10 hover:bg-zinc-50/55 dark:hover:bg-zinc-800/10 group transition-all"
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                        {entry.label}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-md border font-bold capitalize ${badgeColor}`}>
                          {entry.category}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-medium">
                          {entry.value} {entry.unit}
                        </span>
                        <span className="text-[9px] text-zinc-400 font-medium ms-0.5">
                          • {new Date(entry.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 select-none">
                      <span className="text-xs font-bold text-[#065f46] dark:text-emerald-450 whitespace-nowrap">
                        {entry.carbonEmissions} kg
                      </span>
                      <button
                        onClick={() => onRemoveEntry(entry.id)}
                        className="p-1 rounded-md text-zinc-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/45 dark:text-zinc-650 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all pointer-events-auto"
                        title="Delete log entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#edf2ed] dark:border-zinc-800/60 flex items-center justify-between text-xs text-zinc-450 font-medium">
          <span>Total Logged Entries:</span>
          <span>{recentEntries.length} items</span>
        </div>
      </div>
    </div>
  );
}
