import { useState, useRef, useEffect, FormEvent } from "react";
import { Sparkles, MessageSquare, Send, ChevronRight, HelpCircle, Loader2, ArrowRight } from "lucide-react";
import { CarbonEntry, HabitAction, UserProfile, InsightReport, ChatMessage, CarbonCategory } from "../types";

interface AiAdvisorProps {
  entries: CarbonEntry[];
  habits: HabitAction[];
  userProfile: UserProfile;
}

export default function AiAdvisor({ entries, habits, userProfile }: AiAdvisorProps) {
  const [activeTab, setActiveTab] = useState<"insights" | "chat">("insights");
  
  // Insights State
  const [report, setReport] = useState<InsightReport | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      sender: "advisor",
      text: "Hi there! I'm Carbon Buddy, your personal sustainability advisor. Ask me anything about environmental choices, recycling, meal footprints, or how to optimize your daily energy habits!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Request AI Report
  const generateReport = async () => {
    setLoadingReport(true);
    setReportError(null);
    try {
      const response = await fetch("/api/advisor/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entries,
          habits: habits.filter((h) => h.committed),
          userProfile,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to contact advisor endpoint");
      }

      const data: InsightReport = await response.json();
      setReport(data);
    } catch (err: any) {
      console.error(err);
      setReportError("We had a minor setback connecting to the climate advisor service. Please check your credentials or retry.");
    } finally {
      setLoadingReport(false);
    }
  };

  // Chat Submit
  const handleChatSubmit = async (e?: FormEvent, promptOverride?: string) => {
    e?.preventDefault();
    const textToSend = promptOverride || chatInput;
    if (!textToSend.trim() || sendingChat) return;

    const userMessage: ChatMessage = {
      id: "msg_" + Math.random().toString(36).substring(2, 9),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setSendingChat(true);

    try {
      const response = await fetch("/api/advisor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: chatMessages,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not process chat question");
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: "msg_" + Math.random().toString(36).substring(2, 9),
        sender: "advisor",
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage: ChatMessage = {
        id: "msg_err_" + Math.random(),
        sender: "advisor",
        text: "I experienced a connection hiccup while estimating that carbon factor. Please try again! Your local environment state remains fully preserved.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setSendingChat(false);
    }
  };

  const samplePrompts = [
    "Beef vs. tofu: how big is the carbon gap?",
    "Is it better to wash dishes by hand or dishwasher?",
    "Are glass jars lower footprint than aluminium cans?",
    "How much carbon does taking the train save over driving?",
  ];

  const getCategoryTheme = (cat: CarbonCategory) => {
    switch (cat) {
      case "transport": return { border: "border-blue-150", bg: "bg-blue-50/20 dark:bg-blue-950/20", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500" };
      case "food": return { border: "border-emerald-150", bg: "bg-emerald-50/20 dark:bg-emerald-950/20", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" };
      case "utilities": return { border: "border-amber-150", bg: "bg-amber-50/20 dark:bg-amber-950/20", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500" };
      case "shopping": return { border: "border-purple-150", bg: "bg-purple-50/20 dark:bg-purple-950/20", text: "text-purple-700 dark:text-purple-400", dot: "bg-purple-500" };
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-[#edf2ed] dark:border-zinc-800/80 rounded-[20px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.015)] flex flex-col justify-between h-[520px]">
      <div>
        {/* Toggle Header */}
        <div className="flex border-b border-[#edf2ed] dark:border-zinc-800/80 pb-4 justify-between items-center">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              AI Sustainability Advisor
            </h3>
          </div>

          <div className="flex bg-[#f4f7f4] dark:bg-zinc-950 rounded-xl p-0.5 text-[11px] font-bold">
            <button
              onClick={() => setActiveTab("insights")}
              className={`px-3 py-1.5 rounded-md inline-flex items-center gap-1.5 transition-all ${
                activeTab === "insights"
                  ? "bg-white dark:bg-zinc-900 text-[#065f46] dark:text-emerald-400 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                  : "text-zinc-500 hover:text-[#10b981] dark:hover:text-zinc-300"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Insights
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-3 py-1.5 rounded-md inline-flex items-center gap-1.5 transition-all ${
                activeTab === "chat"
                  ? "bg-white dark:bg-zinc-900 text-[#065f46] dark:text-emerald-400 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                  : "text-zinc-500 hover:text-[#10b981] dark:hover:text-zinc-300"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Carbon Buddy Chat
            </button>
          </div>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 mt-4 overflow-y-auto min-h-0 pr-1">
        {activeTab === "insights" ? (
          /* SECTION 1: AI Carbon Report */
          <div className="h-full flex flex-col">
            {!report ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[#fafcfa] dark:bg-zinc-950/25 border border-dashed border-[#edf2ed] dark:border-zinc-850 rounded-xl">
                <Sparkles className="w-8 h-8 text-emerald-500 mb-3 animate-pulse" />
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Generate Personalized Footprint Report
                </h4>
                <p className="text-xs text-zinc-450 dark:text-zinc-500 max-w-sm mt-1 mb-5 leading-relaxed">
                  Our LLM advisor reviews your logged transits, diets, habits, and utilities to generate specific carbon abatement insights.
                </p>
                <button
                  onClick={generateReport}
                  disabled={loadingReport}
                  className="px-4 py-2.5 bg-[#065f46] text-white hover:bg-[#044e39] font-semibold text-xs rounded-xl transition-all inline-flex items-center gap-2"
                >
                  {loadingReport ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Assessing footprints...
                    </>
                  ) : (
                    <>
                      Analyze Activity Log
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
                {reportError && (
                  <p className="text-[10px] text-rose-500 font-semibold mt-3 max-w-[280px]">
                    {reportError}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary Header */}
                <div className="p-4 bg-[#fafcfa] dark:bg-zinc-950 border border-[#edf2ed] dark:border-zinc-850 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] uppercase font-extrabold tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-md border border-emerald-100/40">
                      Advisor Analysis {report.isAiGenerated ? "(Live Gemini)" : "(Local Estimate)"}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium">
                      {new Date(report.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-semibold">
                    {report.summary}
                  </p>
                </div>

                {/* Strengths */}
                <div>
                  <h4 className="text-[10px] uppercase font-bold tracking-[0.1em] text-zinc-400 dark:text-zinc-500 mb-2">
                    Your Carbon Strengths
                  </h4>
                  <div className="space-y-1.5 text-xs text-zinc-750 dark:text-zinc-350">
                    {report.strengths.map((str, idx) => (
                      <div key={idx} className="flex gap-2 items-start bg-[#fcfdfc] dark:bg-zinc-900 p-2.5 rounded-lg border border-[#edf2ed] dark:border-zinc-850">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span className="leading-normal font-medium text-zinc-800 dark:text-zinc-300">{str}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="pt-2">
                  <h4 className="text-[10px] uppercase font-bold tracking-[0.1em] text-zinc-400 dark:text-zinc-500 mb-2.5">
                    High-Impact reduction plans
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {report.recommendations.map((rec, idx) => {
                      const theme = getCategoryTheme(rec.category);
                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border flex flex-col justify-between ${theme?.bg} ${theme?.border}`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${theme?.dot}`} />
                              <span className={`text-[9px] font-bold uppercase ${theme?.text}`}>
                                {rec.category}
                              </span>
                            </div>
                            <h5 className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100">
                              {rec.title}
                            </h5>
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal mt-1 mb-2.5">
                              {rec.description}
                            </p>
                          </div>
                          <span className={`text-[10px] font-bold ${theme?.text}`}>
                            Estimate: {rec.savingsEstimate}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Regenerate CTA */}
                <div className="flex pt-3 justify-end animate-fade-in">
                  <button
                    onClick={generateReport}
                    disabled={loadingReport}
                    className="text-[10px] font-bold text-[#065f46] hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#edf2ed] dark:border-zinc-800 bg-[#fafcfa] dark:bg-zinc-950"
                  >
                    {loadingReport ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        Re-Analyze Activity History
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* SECTION 2: Conversation Q&A */
          <div className="h-full flex flex-col justify-between">
            {/* Scrollable messages panel */}
            <div className="flex-1 overflow-y-auto space-y-3 pb-3 pr-1">
              {chatMessages.map((msg) => {
                const isUser = msg.sender === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[85%] ${
                      isUser ? "ml-auto items-end" : "mr-auto items-start"
                    }`}
                  >
                    <div
                      className={`text-xs p-3 rounded-2xl leading-relaxed font-semibold transition-all ${
                        isUser
                          ? "bg-[#065f46] border border-[#044e39] text-white rounded-br-none"
                          : "bg-[#fbfdfb] dark:bg-zinc-950 border border-[#edf2ed] dark:border-zinc-850 text-zinc-800 dark:text-zinc-200 rounded-bl-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-zinc-400 font-medium mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                );
              })}
              {sendingChat && (
                <div className="flex mr-auto items-start max-w-[85%]">
                  <div className="text-xs p-3 rounded-2xl bg-[#fbfdfb] dark:bg-zinc-950 border border-[#edf2ed] dark:border-zinc-800/80 text-zinc-450 inline-flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    Carbon Buddy is calculating...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Suggestions & Input Controls */}
            <div className="mt-2 border-t border-[#edf2ed] dark:border-zinc-800/50 pt-3">
              {/* Sample Quick Questions list */}
              {chatMessages.length === 1 && (
                <div className="mb-3">
                  <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-[0.1em] block mb-1.5 flex items-center gap-1">
                    <HelpCircle className="w-3 h-3 text-emerald-600" />
                    Recommended questions
                  </span>
                  <div className="flex gap-1.5 flex-wrap">
                    {samplePrompts.map((p) => (
                      <button
                        key={p}
                        onClick={(e) => handleChatSubmit(e, p)}
                        disabled={sendingChat}
                        className="text-[10px] font-bold text-zinc-650 dark:text-zinc-350 hover:bg-[#e6f4ea]/40 hover:border-emerald-500/20 bg-zinc-50 dark:bg-zinc-950 border border-[#edf2ed] dark:border-zinc-850 px-2.5 py-1 text-left rounded-lg transition-all"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Input form */}
              <form onSubmit={(e) => handleChatSubmit(e)} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask any carbon footprint or eco question..."
                  required
                  disabled={sendingChat}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 h-10 px-3 py-2 text-xs border border-[#edf2ed] dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={sendingChat || !chatInput.trim()}
                  className="w-10 h-10 rounded-xl bg-[#065f46] text-white hover:bg-[#044e39] inline-flex items-center justify-center transition-all disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
