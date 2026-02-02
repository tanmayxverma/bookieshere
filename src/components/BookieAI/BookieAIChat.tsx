import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Trash2, Loader2, Mic, ImagePlus, Sparkles, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookieChat } from "@/hooks/useBookieChat";
import { ChatMessage } from "./ChatMessage";
import { QuickActions } from "./QuickActions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function BookieAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  
  const { messages, isLoading, error, sendMessage, clearChat } = useBookieChat();

  // Smooth auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, []);

  // Scroll when messages change
  useEffect(() => {
    // Small delay to ensure content is rendered
    const timer = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(timer);
  }, [messages, isLoading, scrollToBottom]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 100) + "px";
    }
  }, [input]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast.error("Speech recognition error", {
          description: "Please try again or type your message."
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      if (!hasInteracted) setHasInteracted(true);
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
    if (!hasInteracted) setHasInteracted(true);
    sendMessage(message);
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.info("Speech recognition not supported", {
        description: "Your browser doesn't support speech recognition."
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleImageUpload = () => {
    toast.info("Image analysis coming soon!", {
      description: "We're working on adding image question analysis."
    });
  };

  const handleClearChat = () => {
    clearChat();
    setHasInteracted(false);
  };

  // Show quick actions only before first interaction
  const showQuickActions = !hasInteracted && messages.length <= 1;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-5 right-5 z-50 p-4 rounded-2xl",
          "bg-gradient-to-br from-primary via-blue-500 to-violet-500",
          "text-white shadow-xl",
          "transition-all duration-300 ease-out",
          "hover:scale-105 hover:shadow-2xl hover:shadow-primary/30",
          "active:scale-95",
          "group",
          isOpen && "opacity-0 pointer-events-none scale-0"
        )}
        aria-label="Open Bookie AI Chat"
      >
        <div className="relative">
          <Sparkles className="h-6 w-6 transition-transform group-hover:rotate-12" />
        </div>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
      </button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-5 right-5 z-50",
          "w-[400px] max-w-[calc(100vw-40px)] h-[600px] max-h-[calc(100vh-100px)]",
          "rounded-2xl overflow-hidden",
          "bg-surface-2 backdrop-blur-xl",
          "border border-border/50",
          "shadow-2xl shadow-primary/10",
          "flex flex-col",
          "transition-all duration-300 ease-out origin-bottom-right",
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-surface-1">
          <div className="flex items-center gap-3">
            {/* AI Logo */}
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-blue-500 to-violet-500 flex items-center justify-center shadow-md">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground text-sm">Bookie AI 🤖</h3>
              <p className="text-xs text-muted-foreground">Your personal study assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearChat}
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              title="Clear chat"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              title="Close chat"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages Container - Single scroll container */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4"
        >
          <div className="space-y-3">
            {messages.map((msg, i) => (
              <ChatMessage 
                key={i} 
                role={msg.role} 
                content={msg.content} 
                isLatest={i === messages.length - 1}
              />
            ))}
            
            {/* Typing Indicator */}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-3 py-2 animate-fade-in">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-surface-1 flex items-center justify-center border border-border/40">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="inline-flex items-center gap-1.5 bg-surface-1 rounded-xl rounded-tl-sm px-4 py-3 border border-border/30">
                    <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} className="h-1" />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-4 mb-2 px-3 py-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
            {error}
          </div>
        )}

        {/* Quick Actions - Only before first interaction */}
        {showQuickActions && (
          <QuickActions onAction={handleQuickAction} disabled={isLoading} />
        )}

        {/* Input Area */}
        <div className="border-t border-border/40 bg-surface-1 p-3">
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            {/* Side Action Buttons */}
            <div className="flex gap-1 pb-0.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleVoiceInput}
                className={cn(
                  "h-9 w-9 rounded-lg transition-all",
                  isListening 
                    ? "text-destructive bg-destructive/10 hover:bg-destructive/20" 
                    : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                )}
                title={isListening ? "Stop listening" : "Voice input"}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleImageUpload}
                className="h-9 w-9 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
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
                placeholder="Ask me anything about your studies…"
                disabled={isLoading}
                rows={1}
                className={cn(
                  "w-full resize-none rounded-xl px-4 py-2.5",
                  "bg-background border border-border/50",
                  "text-sm placeholder:text-muted-foreground/60",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-all duration-200",
                  "scrollbar-hidden"
                )}
                style={{ maxHeight: "100px" }}
              />
            </div>

            {/* Send Button */}
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className={cn(
                "h-10 w-10 rounded-xl",
                "bg-gradient-to-br from-primary via-blue-500 to-violet-500",
                "hover:from-primary/90 hover:via-blue-500/90 hover:to-violet-500/90",
                "shadow-md",
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
          </form>
        </div>
      </div>
    </>
  );
}

// Add types for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
