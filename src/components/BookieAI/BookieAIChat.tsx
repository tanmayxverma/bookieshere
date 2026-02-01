import { useState, useRef, useEffect } from "react";
import { X, Send, Trash2, Loader2, Mic, ImagePlus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBookieChat } from "@/hooks/useBookieChat";
import { ChatMessage } from "./ChatMessage";
import { QuickActions } from "./QuickActions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function BookieAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, isLoading, error, sendMessage, clearChat } = useBookieChat();

  // Smooth auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput("");
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleQuickAction = (message: string) => {
    sendMessage(message);
  };

  const handleVoiceInput = () => {
    toast.info("Voice input coming soon!", {
      description: "We're working on adding speech-to-text functionality."
    });
  };

  const handleImageUpload = () => {
    toast.info("Image upload coming soon!", {
      description: "Soon you'll be able to upload question images for analysis."
    });
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 p-4 rounded-2xl",
          "bg-gradient-to-br from-pink-500 via-purple-500 to-violet-600",
          "text-white shadow-xl",
          "transition-all duration-300 ease-out",
          "hover:scale-110 hover:shadow-[0_0_40px_rgba(168,85,247,0.5)]",
          "active:scale-95",
          "group",
          isOpen && "opacity-0 pointer-events-none scale-0"
        )}
        aria-label="Open Bookie AI Chat"
      >
        <div className="relative">
          <Sparkles className="h-6 w-6 transition-transform group-hover:rotate-12" />
          <div className="absolute inset-0 animate-ping opacity-20">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-background animate-pulse" />
      </button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "w-[420px] max-w-[calc(100vw-32px)] h-[620px] max-h-[calc(100vh-80px)]",
          "rounded-3xl overflow-hidden",
          "bg-background/98 backdrop-blur-2xl",
          "border border-border/40",
          "shadow-2xl shadow-purple-500/20",
          "flex flex-col",
          "transition-all duration-300 ease-out origin-bottom-right",
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-violet-500/5">
          <div className="flex items-center gap-3">
            {/* AI Logo - Brain/Spark style */}
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Sparkles className="h-5 w-5 text-white" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground text-base">Bookie AI 🤖</h3>
              <p className="text-xs text-muted-foreground">Your personal study assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={clearChat}
              className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              title="Clear chat"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              title="Close chat"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4 py-3" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <ChatMessage 
                key={i} 
                role={msg.role} 
                content={msg.content} 
                isLatest={i === messages.length - 1}
              />
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-3 py-2 animate-fade-in">
                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-violet-500/20 flex items-center justify-center">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-muted-foreground mb-1">Bookie AI</div>
                  <div className="text-sm text-muted-foreground italic">Thinking...</div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Error Message */}
        {error && (
          <div className="mx-4 mb-2 px-4 py-3 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-xl">
            {error}
          </div>
        )}

        {/* Quick Actions */}
        <QuickActions onAction={handleQuickAction} disabled={isLoading} />

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-border/40 bg-muted/20">
          <div className="flex items-end gap-2">
            {/* Side Action Buttons */}
            <div className="flex gap-1 pb-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleVoiceInput}
                className="h-9 w-9 rounded-xl text-muted-foreground hover:text-purple-400 hover:bg-purple-500/10 transition-all"
                title="Voice input"
              >
                <Mic className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleImageUpload}
                className="h-9 w-9 rounded-xl text-muted-foreground hover:text-purple-400 hover:bg-purple-500/10 transition-all"
                title="Upload image"
              >
                <ImagePlus className="h-4 w-4" />
              </Button>
            </div>

            {/* Input Field */}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about your studies..."
                disabled={isLoading}
                rows={1}
                className={cn(
                  "w-full resize-none rounded-2xl px-4 py-3 pr-12",
                  "bg-background/80 border border-border/50",
                  "text-sm placeholder:text-muted-foreground/70",
                  "focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-all duration-200",
                  "scrollbar-thin scrollbar-thumb-muted"
                )}
                style={{ maxHeight: "120px" }}
              />
            </div>

            {/* Send Button */}
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className={cn(
                "h-11 w-11 rounded-xl",
                "bg-gradient-to-br from-pink-500 via-purple-500 to-violet-600",
                "hover:from-pink-600 hover:via-purple-600 hover:to-violet-700",
                "shadow-lg shadow-purple-500/25",
                "disabled:opacity-50 disabled:shadow-none",
                "transition-all duration-200"
              )}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
