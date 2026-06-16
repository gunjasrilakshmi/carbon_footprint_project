import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { CarbonEntry, CarbonCategory } from "../types";

interface CarbonChartsProps {
  entries: CarbonEntry[];
  targetWeeklyLimit: number;
}

const CATEGORY_COLORS: Record<CarbonCategory, string> = {
  transport: "#60a5fa", // Soft Blue
  food: "#059669",      // Soft Emerald / Forest Green
  utilities: "#f59e0b", // Amber
  shopping: "#a855f7",  // Purple
};

const CATEGORY_LABELS: Record<CarbonCategory, string> = {
  transport: "Transportation",
  food: "Food & Diet",
  utilities: "Utilities & Home",
  shopping: "Shopping & Goods",
};

export default function CarbonCharts({ entries, targetWeeklyLimit }: CarbonChartsProps) {
  // Aggregate emissions by category for Pie Chart
  const categoryTotals: Record<CarbonCategory, number> = {
    transport: 0,
    food: 0,
    utilities: 0,
    shopping: 0,
  };

  entries.forEach((e) => {
    categoryTotals[e.category] = Number((categoryTotals[e.category] + e.carbonEmissions).toFixed(1));
  });

  const pieData = (Object.keys(categoryTotals) as CarbonCategory[])
    .map((cat) => ({
      name: CATEGORY_LABELS[cat],
      value: categoryTotals[cat],
      categoryKey: cat,
    }))
    .filter((d) => d.value > 0);

  const totalWeeklyEmissions = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  // Group emissions by date for the last 7 days Bar Chart
  const dailyTracker: Record<string, number> = {};
  
  // Initialize last 7 days with 0s
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    dailyTracker[dateStr] = 0;
  }

  entries.forEach((e) => {
    if (dailyTracker[e.date] !== undefined) {
      dailyTracker[e.date] = Number((dailyTracker[e.date] + e.carbonEmissions).toFixed(1));
    }
  });

  const barData = Object.keys(dailyTracker).map((date) => {
    const dObj = new Date(date + "T00:00:00");
    const dayName = dObj.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
    const shortDate = dObj.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
    return {
      dateLabel: dayName,
      fullDateLabel: shortDate,
      Emissions: dailyTracker[date],
    };
  });

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percent = totalWeeklyEmissions > 0 ? ((data.value / totalWeeklyEmissions) * 100).toFixed(1) : 0;
      return (
        <div className="bg-[#fbfdfb] border border-[#edf2ed] rounded-xl p-3 shadow-sm text-xs text-zinc-800">
          <p className="font-bold mb-1">{data.name}</p>
          <p style={{ color: CATEGORY_COLORS[data.categoryKey as CarbonCategory] }} className="font-semibold">
            {data.value.toFixed(1)} kg CO₂e ({percent}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#fbfdfb] border border-[#edf2ed] rounded-xl p-3 shadow-sm text-xs text-zinc-800">
          <p className="font-semibold mb-1 text-zinc-500">{data.fullDateLabel}</p>
          <p className="font-bold text-[#065f46]">
            {data.Emissions.toFixed(1)} kg CO₂e
          </p>
          {targetWeeklyLimit > 0 && (
            <p className="text-zinc-450 text-[10px] mt-1 font-medium">
              Daily Budget: ~{(targetWeeklyLimit / 7).toFixed(1)} kg
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
      {/* 1. Category Distribution Pie Chart */}
      <div className="bg-white dark:bg-zinc-900 border border-[#edf2ed] dark:border-zinc-800/80 rounded-[20px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.015)] flex flex-col justify-between h-[360px]">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Carbon Source Contribution
          </h3>
          <p className="text-xs text-zinc-450 dark:text-zinc-500 mt-1">
            Visual division of your total logged impact across categories
          </p>
        </div>

        <div className="flex-1 min-h-[200px] flex items-center justify-center relative">
          {pieData.length === 0 ? (
            <div className="text-center text-xs text-zinc-400 font-medium">
              No logged activities yet. Add logs to populate your carbon division!
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={88}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => {
                    const keys = Object.keys(CATEGORY_COLORS) as CarbonCategory[];
                    const matchingKey = keys.find(k => CATEGORY_LABELS[k] === entry.name);
                    const color = matchingKey ? CATEGORY_COLORS[matchingKey] : "#cccccc";
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={32} 
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span className="text-xs text-zinc-600 dark:text-zinc-300 font-medium">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 2. Daily Emissions Trend Bar Chart */}
      <div className="bg-white dark:bg-zinc-900 border border-[#edf2ed] dark:border-zinc-800/80 rounded-[20px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.015)] flex flex-col justify-between h-[360px]">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Daily Carbon Output
          </h3>
          <p className="text-xs text-zinc-450 dark:text-zinc-500 mt-1">
            Emissions generated daily relative to your targets
          </p>
        </div>

        <div className="flex-1 min-h-[200px] mt-4 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf2ed" className="dark:stroke-zinc-800/60" />
              <XAxis 
                dataKey="dateLabel" 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: "#71717a", fontSize: 11, fontWeight: 500 }}
              />
              <YAxis 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: "#71717a", fontSize: 11 }}
                unit=" kg"
              />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(113, 113, 122, 0.03)" }} />
              <Bar 
                dataKey="Emissions" 
                fill="#059669" 
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
              >
                {barData.map((entry, idx) => {
                  const dailyBudget = targetWeeklyLimit / 7;
                  const isOver = entry.Emissions > dailyBudget;
                  // Color soft red if exceeded, otherwise soft forest green
                  return (
                    <Cell 
                      key={`bar-cell-${idx}`} 
                      fill={isOver ? "#f43f5e" : "#059669"} 
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
