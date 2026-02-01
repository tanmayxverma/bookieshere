import ReactMarkdown from "react-markdown";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isBot = role === "assistant";

  return (
    <div
      className={cn(
        "flex gap-3 p-3 rounded-lg animate-fade-in",
        isBot ? "bg-accent/30" : "bg-muted/50"
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isBot
            ? "bg-gradient-to-br from-pink-500/20 to-purple-500/20 text-pink-400"
            : "bg-primary/20 text-primary"
        )}
      >
        {isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
      </div>
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="text-xs font-medium text-muted-foreground mb-1">
          {isBot ? "Bookie AI 🤖" : "You"}
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 leading-relaxed">
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
              li: ({ children }) => <li className="mb-1">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
              a: ({ href, children }) => (
                <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
              code: ({ children }) => (
                <code className="bg-muted px-1 py-0.5 rounded text-xs">{children}</code>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
