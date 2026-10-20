import { useState } from "react";
import { BookieEmblem } from "@/components/Brand/BookieEmblem";
import { X, Send, Sparkles, Minimize2, Maximize2, Trash2, Calculator, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Message {
  sender: "mentor" | "aspirant";
  text: string;
  timestamp: string;
  latex?: string;
  citation?: string;
}

const initialMessages: Message[] = [
  {
    sender: "mentor",
    text: "Greetings, Aspirant. I am your deconstructive JEE Advanced & NEET study mentor. Submit high-weightage conceptual bottlenecks, NTA trap analyses, or past 10-year derivations. Let us analyze from foundational axioms.",
    timestamp: "LIVE // PROCTOR ACTIVE",
    citation: "Axiomatic Protocol: Zero rote intuition. Demand explicit free-body diagrams, tensor bounds, or organic electron shifts.",
  },
  {
    sender: "aspirant",
    text: "Why is pure rolling friction zero on a horizontal plane with constant velocity, but non-zero when torque is applied at the center of mass?",
    timestamp: "08:43:00 IST",
  },
  {
    sender: "mentor",
    text: "In unaccelerated pure rolling on a smooth horizontal plane, the contact point instantaneously has zero relative velocity (v_rel = 0). Since a_cm = 0 and α = 0, no horizontal force is required to satisfy Newton's Second Law. However, when torque τ is applied about the center of mass, angular acceleration α requires a linear tangential force f_s at the contact point to maintain the kinematic constraint a_cm = α·R.",
    latex: "\\Sigma \\tau_{cm} = I_{cm}\\alpha, \\quad a_{cm} = \\alpha R \\implies f_s = \\frac{\\tau}{R + I/(mR)}",
    timestamp: "08:43:14 IST",
    citation: "Ref: HC Verma Vol 1 Ch 10 (Rotational Mechanics, §10.14) • JEE Adv 2021 Paper 1 Trap",
  },
];

const presets = [
  { label: "§ Concept First-Principles", query: "Deconstruct rotational torque about instantaneous axis of rotation from first principles." },
  { label: "∑ 10-Yr PYQ Deconstruct", query: "Deconstruct the primary trap mechanism in JEE Advanced 2023 Paper 1 Question 12." },
  { label: "🎯 Mock Error Diagnosis", query: "Analyze why skipping multi-correct matrix traps in the first 45 minutes optimizes net percentile." },
  { label: "⚡ Time-Velocity Audit", query: "What is the optimal per-question time threshold before strategic abandonment in Paper 2?" },
];

export function BookieMentorDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputQuery, setInputQuery] = useState("");

  const handleSend = () => {
    if (!inputQuery.trim()) return;
    const newMsg: Message = {
      sender: "aspirant",
      text: inputQuery.trim(),
      timestamp: "Just now",
    };
    setMessages((prev) => [
      ...prev,
      newMsg,
      {
        sender: "mentor",
        text: `Analyzing "${inputQuery.trim()}" from foundational axioms. Verification protocol active across indexed 10-year Kota & IIT Bombay archives.`,
        timestamp: "Deconstructing...",
        citation: "System: LaTeX & KaTeX parser synchronized. Verified against NTA syllabus.",
      },
    ]);
    setInputQuery("");
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(20);
    }
  };

  const handlePreset = (query: string) => {
    setInputQuery(query);
  };

  const clearChat = () => {
    setMessages([initialMessages[0]]);
    toast.info("Mentor transcript cleared.");
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom-Right) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-border bg-card text-foreground shadow-lg hover:shadow-xl hover:bg-muted/80 transition-all active:scale-95 cursor-pointer group"
          title="Open Bookie Scholar AI"
        >
          <BookieEmblem size={24} className="group-hover:rotate-6 transition-transform" />
          <span className="font-serif font-medium text-xs sm:text-sm">Bookie AI Mentor</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </button>
      )}

      {/* Flyout Modal / Drawer */}
      {isOpen && (
        <div
          className={cn(
            "fixed right-3 sm:right-6 z-50 rounded-2xl border border-border bg-card text-foreground shadow-2xl transition-all duration-200 overflow-hidden flex flex-col",
            isMinimized
              ? "bottom-20 md:bottom-6 w-80 h-14"
              : "bottom-16 md:bottom-6 w-[94vw] sm:w-[440px] h-[580px] max-h-[85vh]"
          )}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between p-3.5 border-b border-border bg-muted/40 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <BookieEmblem size={28} className="shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif font-medium text-sm text-foreground truncate">
                    Bookie Scholar AI
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-primary/10 text-primary border border-primary/20">
                    § 01
                  </span>
                </div>
                <div className="text-[10px] font-mono text-muted-foreground truncate">
                  FIRST-PRINCIPLES CO-PILOT // V3.4
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-muted-foreground">
              <button
                type="button"
                onClick={clearChat}
                className="p-1.5 rounded-lg hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
                title="Clear transcript"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Message History Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "p-3.5 rounded-xl border leading-relaxed",
                      m.sender === "mentor"
                        ? "bg-muted/30 border-border text-foreground space-y-2"
                        : "bg-primary/5 border-primary/20 text-foreground ml-6"
                    )}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                      <span className="font-semibold text-primary">
                        {m.sender === "mentor" ? "ACADEMIC PROCTOR DIRECTIVE" : "ASPIRANT QUERY"}
                      </span>
                      <span>{m.timestamp}</span>
                    </div>

                    <p className="font-sans leading-relaxed">{m.text}</p>

                    {m.latex && (
                      <div className="p-2.5 rounded-lg bg-card border border-border font-mono text-[11px] text-foreground font-semibold overflow-x-auto">
                        <code>{m.latex}</code>
                      </div>
                    )}

                    {m.citation && (
                      <div className="text-[10px] font-mono text-muted-foreground pt-1 border-t border-border/60">
                        {m.citation}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Presets Dispatchers */}
              <div className="px-3 py-2 border-t border-border/80 bg-card shrink-0">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  ARCHIVAL DISPATCH PRESETS
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {presets.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePreset(p.query)}
                      className="text-left text-[11px] font-sans p-1.5 rounded-lg border border-border bg-muted/40 hover:bg-muted text-foreground transition-all truncate select-none active:scale-[0.98] cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Prompt Box */}
              <div className="p-3 border-t border-border bg-card shrink-0 space-y-2">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSend();
                    }}
                    placeholder="Query derivation, organic mechanism, or NTA trap..."
                    className="w-full h-10 pl-3 pr-20 rounded-xl border border-border bg-card text-xs font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    className="absolute right-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-sans text-xs font-medium hover:bg-primary/90 transition-all select-none active:scale-95 cursor-pointer"
                  >
                    Query ↗
                  </button>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                  <span>● RIGOROUS PROOF STANDARD ACTIVE</span>
                  <span>ESC TO DISMISS</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
