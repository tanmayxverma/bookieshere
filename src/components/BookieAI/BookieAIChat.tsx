import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Trash2, Loader2, Mic, ImagePlus, Sparkles, MicOff, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookieChat } from "@/hooks/useBookieChat";
import { ChatMessage } from "./ChatMessage";
import { QuickActions } from "./QuickActions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type VoiceState = "idle" | "listening" | "processing";

export function BookieAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [input, setInput] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

  // ESC to exit fullscreen
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isFullscreen]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceState("processing");
        setTimeout(() => {
          setInput(prev => prev + transcript);
          setVoiceState("idle");
        }, 500);
      };

      recognitionRef.current.onerror = () => {
        setVoiceState("idle");
        toast.error("Speech recognition error", {
          description: "Please try again or type your message."
        });
      };

      recognitionRef.current.onend = () => {
        if (voiceState === "listening") {
          setVoiceState("idle");
        }
      };
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      if (!hasInteracted) setHasInteracted(true);
      sendMessage(input);
      setInput("");
      setUploadedImage(null);
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

    if (voiceState === "listening") {
      recognitionRef.current.stop();
      setVoiceState("idle");
    } else {
      recognitionRef.current.start();
      setVoiceState("listening");
    }
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Please upload an image file");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        // Brief analysis state - NO forced text, NO toasts
        setIsAnalyzingImage(true);
        setTimeout(() => {
          setIsAnalyzingImage(false);
          // Input stays empty - user types naturally
        }, 800);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleClearChat = () => {
    clearChat();
    setHasInteracted(false);
    setUploadedImage(null);
  };

  const showQuickActions = !hasInteracted && messages.length <= 1;

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

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
          "fixed z-50 flex flex-col",
          "bg-surface-2 backdrop-blur-xl",
          "border border-border/50",
          "shadow-2xl shadow-primary/10",
          "transition-all duration-300 ease-out",
          // Docked mode
          !isFullscreen && "bottom-5 right-5 w-[420px] max-w-[calc(100vw-40px)] h-[620px] max-h-[calc(100vh-100px)] rounded-2xl origin-bottom-right",
          // Fullscreen mode
          isFullscreen && "inset-4 md:inset-8 rounded-2xl max-w-none max-h-none",
          // Open/close state
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-surface-1 rounded-t-2xl">
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
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsOpen(false);
                setIsFullscreen(false);
              }}
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
          <div className={cn("space-y-4", isFullscreen && "max-w-3xl mx-auto")}>
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

        {/* Inline Image Preview - Compact, non-intrusive */}
        {uploadedImage && (
          <div className="mx-4 mb-2">
            <div className="inline-flex items-center gap-2 px-2 py-1.5 bg-surface-1 rounded-lg border border-border/40">
              <div className="relative w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                <img src={uploadedImage} alt="Upload" className="w-full h-full object-cover" />
                {isAnalyzingImage && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {isAnalyzingImage ? "Analyzing..." : "Image attached"}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setUploadedImage(null)}
                className="h-6 w-6 rounded-md text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Quick Actions - Only before first interaction */}
        {showQuickActions && (
          <QuickActions onAction={handleQuickAction} disabled={isLoading} />
        )}

        {/* Input Area */}
        <div className="border-t border-border/40 bg-surface-1 p-3 rounded-b-2xl">
          <form onSubmit={handleSubmit} className={cn("flex items-end gap-2", isFullscreen && "max-w-3xl mx-auto")}>
            {/* Side Action Buttons */}
            <div className="flex gap-1 pb-0.5">
              {/* Voice Input Button with 3 states */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleVoiceInput}
                disabled={voiceState === "processing"}
                className={cn(
                  "h-9 w-9 rounded-lg transition-all relative",
                  voiceState === "idle" && "text-muted-foreground hover:text-primary hover:bg-primary/10",
                  voiceState === "listening" && "text-destructive bg-destructive/10 mic-listening",
                  voiceState === "processing" && "text-primary bg-primary/10"
                )}
                title={voiceState === "idle" ? "Voice input" : voiceState === "listening" ? "Stop listening" : "Processing..."}
              >
                {voiceState === "listening" ? (
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-0.5 h-3 bg-destructive rounded-full waveform-bar"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                ) : voiceState === "processing" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
              
              {/* Image Upload Button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleImageUpload}
                disabled={isAnalyzingImage}
                className={cn(
                  "h-9 w-9 rounded-lg transition-all",
                  isAnalyzingImage 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                )}
                title="Upload image"
              >
                {isAnalyzingImage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ImagePlus className="h-4 w-4" />
                )}
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