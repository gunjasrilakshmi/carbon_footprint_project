import { useState, FormEvent } from "react";
import { Check, Plus, Trophy, Award, Trash2 } from "lucide-react";
import { CarbonCategory, HabitAction, CarbonEntry } from "../types";
import { DEFAULT_HABIT_ACTIONS } from "../utils/carbonCalculations";

interface ActionTrackerProps {
  habits: HabitAction[];
  onToggleCommit: (id: string) => void;
  onCompleteHabit: (id: string, savings: number) => void;
  onAddCustomHabit: (title: string, description: string, category: CarbonCategory, savings: number) => void;
}

export default function ActionTracker({
  habits,
  onToggleCommit,
  onCompleteHabit,
  onAddCustomHabit,
}: ActionTrackerProps) {
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [customCategory, setCustomCategory] = useState<CarbonCategory>("transport");
  const [customSavings, setCustomSavings] = useState("2.5");

  const committedActive = habits.filter((h) => h.committed);
  const availableHabits = habits.filter((h) => !h.committed);

  const handleCustomSubmit = (e: FormEvent) => {
    e.preventDefault();
    const savingsNum = parseFloat(customSavings);
    if (!customTitle.trim() || isNaN(savingsNum) || savingsNum <= 0) return;

    onAddCustomHabit(customTitle, customDesc, customCategory, savingsNum);
    
    // Clear & close
    setCustomTitle("");
    setCustomDesc("");
    setCustomSavings("2.5");
    setShowAddCustom(false);
  };

  const getCategoryColor = (cat: CarbonCategory) => {
    switch (cat) {
      case "transport": return "text-blue-500 bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/30";
      case "food": return "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/30";
      case "utilities": return "text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/30";
      case "shopping": return "text-purple-500 bg-purple-50 dark:bg-purple-950/30 border-purple-100 dark:border-purple-900/30";
    }
  };

  // Check achievements based on progressCounts
  const totalCompletions = habits.reduce((acc, h) => acc + h.progressCount, 0);
  const totalCarbonSaved = habits.reduce((acc, h) => acc + (h.progressCount * h.potentialSavings), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
      {/* 1. Active committed pledges */}
      <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-[#edf2ed] dark:border-zinc-800/80 rounded-[20px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.015)] flex flex-col justify-between min-h-[400px]">
        <div>
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-emerald-600" />
                Active Reduction Pledges
              </h3>
              <p className="text-xs text-zinc-450 dark:text-zinc-500 mt-1">
                Pledges you committed to. Tap &apos;Log Saving&apos; to apply carbon reductions today!
              </p>
            </div>
            
            <button
              onClick={() => setShowAddCustom(!showAddCustom)}
              className="px-3 py-1.5 text-xs font-bold bg-[#fbfdfb] dark:bg-zinc-800 hover:bg-[#edf2ed] rounded-lg text-[#065f46] inline-flex items-center gap-1 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Custom Pledge
            </button>
          </div>

          {/* Custom Habit creation form inside */}
          {showAddCustom && (
            <form onSubmit={handleCustomSubmit} className="bg-[#fbfdfb] dark:bg-zinc-950/80 border border-[#edf2ed] dark:border-zinc-800 p-4 rounded-xl mb-4 text-xs">
              <h4 className="font-bold text-zinc-900 dark:text-zinc-200 mb-3 text-xs">Create New Custom Carbon Pledge</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-[9px] uppercase font-bold tracking-wider text-zinc-400 mb-1">Pledge Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Reusable Mug at Cafe"
                    required
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full h-9 px-3 border border-[#edf2ed] dark:border-zinc-805 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-250 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold tracking-wider text-zinc-400 mb-1">Potential Carbon Savings (kg CO2e)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 2.4"
                    required
                    value={customSavings}
                    onChange={(e) => setCustomSavings(e.target.value)}
                    className="w-full h-9 px-3 border border-[#edf2ed] dark:border-zinc-805 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-250 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-[9px] uppercase font-bold tracking-wider text-zinc-400 mb-1">Short Target Description</label>
                  <input
                    type="text"
                    placeholder="Avoid single-use cups during weekly coffee runs."
                    value={customDesc}
                    onChange={(e) => setCustomDesc(e.target.value)}
                    className="w-full h-9 px-3 border border-[#edf2ed] dark:border-zinc-805 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-250 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold tracking-wider text-zinc-400 mb-1">Pledge Category</label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as CarbonCategory)}
                    className="w-full h-9 px-3 border border-[#edf2ed] dark:border-zinc-805 bg-white dark:bg-zinc-900 text-zinc-850 dark:text-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="transport">Transportation</option>
                    <option value="food">Food & Diet</option>
                    <option value="utilities">Utilities & Home</option>
                    <option value="shopping">Shopping & Goods</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddCustom(false)}
                  className="px-3 h-8 font-semibold rounded-lg border border-[#edf2ed] dark:border-zinc-800 text-zinc-550 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 h-8 font-semibold rounded-lg bg-[#065f46] text-white hover:bg-[#044e39] transition-colors"
                >
                  Create & Pledge
                </button>
              </div>
            </form>
          )}

          {/* Active List */}
          <div className="space-y-3 mt-2 pr-1 max-h-[350px] overflow-y-auto">
            {committedActive.length === 0 ? (
              <div className="text-center py-14 text-xs text-zinc-400 bg-[#fafcfa]/40 dark:bg-zinc-950/40 rounded-2xl border border-dashed border-[#edf2ed] dark:border-zinc-800/60 font-medium px-4">
                No active commitments. Scroll down the right panel and commit to your first Eco-Pledge to begin!
              </div>
            ) : (
              committedActive.map((h) => (
                <div
                  key={h.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-[#edf2ed] dark:border-zinc-800 bg-[#fafcfa]/20 dark:bg-zinc-900/10 gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 border rounded-full font-bold uppercase ${getCategoryColor(h.category)}`}>
                        {h.category}
                      </span>
                      <span className="text-xs font-bold text-zinc-400">
                        Saved: {(h.progressCount * h.potentialSavings).toFixed(1)} kg CO2 total
                      </span>
                    </div>
                    <h4 className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 mt-2">
                      {h.title}
                    </h4>
                    <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                      {h.description}
                    </p>
                    {h.progressCount > 0 && (
                      <div className="mt-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        🔥 Completed {h.progressCount} time{h.progressCount > 1 ? "s" : ""}! Keep it up!
                      </div>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 border-t sm:border-none pt-3 sm:pt-0 border-[#edf2ed] dark:border-zinc-800/40">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      -{h.potentialSavings} kg CO₂e
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onCompleteHabit(h.id, h.potentialSavings)}
                        className="px-3 py-1.5 text-xs text-white bg-[#065f46] hover:bg-[#044e39] font-bold rounded-lg transition-all inline-flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Log Saving
                      </button>
                      <button
                        onClick={() => onToggleCommit(h.id)}
                        className="p-1.5 text-xs text-[#065f46] hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-955/20 rounded-lg border border-transparent transition-all font-semibold"
                        title="Uncommit pledge"
                      >
                        Abandon
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dynamic Achievements Summary Footer */}
        <div className="mt-6 pt-4 border-t border-[#edf2ed] dark:border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f4f7f4] dark:bg-emerald-950/40 border border-[#edf2ed] dark:border-[#065f46]/20 flex items-center justify-center text-[#065f46] dark:text-emerald-400 transition-all">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-150 block">Your Action Achievements</span>
              <span className="text-[10px] text-zinc-450 dark:text-zinc-500 font-semibold">{totalCompletions} actions logged • {totalCarbonSaved.toFixed(1)} kg cumulative emissions saved</span>
            </div>
          </div>
          <div className="text-xs font-semibold text-zinc-850 dark:text-zinc-300">
            🌳 Equal to absorbing <span className="text-[#065f46] dark:text-emerald-400 font-bold">{(totalCarbonSaved / 0.06).toFixed(0)}</span> tree-days of CO₂
          </div>
        </div>
      </div>

      {/* 2. Available targets picker */}
      <div className="bg-white dark:bg-zinc-900 border border-[#edf2ed] dark:border-zinc-800/80 rounded-[20px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.015)] flex flex-col h-full min-h-[400px]">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Available Carbon Pledges
          </h3>
          <p className="text-xs text-zinc-450 dark:text-zinc-500 mt-1">
            Commit to these routines to reduce your daily carbon footprints
          </p>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 mt-4 max-h-[350px]">
          {availableHabits.length === 0 ? (
            <div className="text-center py-10 text-xs text-zinc-400 border border-dashed border-[#edf2ed] dark:border-zinc-800 bg-[#fbfdfb] dark:bg-zinc-950/40 rounded-xl font-medium px-4">
              You are pledged to all available goals! Or click &apos;Custom Pledge&apos; to create your own environmental challenges.
            </div>
          ) : (
            availableHabits.map((h) => (
              <div
                key={h.id}
                className="p-3.5 rounded-xl border border-[#edf2ed] bg-[#fafcfa]/20 hover:bg-zinc-50/50 dark:border-zinc-850 dark:bg-zinc-900/40 dark:hover:bg-zinc-800/30 flex flex-col justify-between gap-3 text-xs transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5 font-sans">
                    <span className={`text-[9px] px-1.5 py-0.2 border rounded-md font-bold uppercase ${getCategoryColor(h.category)}`}>
                      {h.category}
                    </span>
                    <span className="text-xs font-bold text-zinc-650 dark:text-zinc-350">
                      -{h.potentialSavings} kg / use
                    </span>
                  </div>
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                    {h.title}
                  </h4>
                  <p className="text-[10px] text-zinc-500 mt-1 line-clamp-2">
                    {h.description}
                  </p>
                </div>

                <button
                  onClick={() => onToggleCommit(h.id)}
                  className="w-full py-1.5 font-bold hover:bg-[#065f46] text-zinc-800 hover:text-white bg-[#fbfdfb] dark:bg-zinc-800 dark:text-zinc-150 dark:hover:bg-zinc-100 dark:hover:text-zinc-900 rounded-lg text-[10px] transition-all flex items-center justify-center gap-1 border border-[#edf2ed] dark:border-zinc-700/40"
                >
                  <Plus className="w-3 h-3" />
                  Pledge to Habit
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
