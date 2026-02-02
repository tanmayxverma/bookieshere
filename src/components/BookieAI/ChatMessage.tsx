import ReactMarkdown from "react-markdown";
import { Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isLatest?: boolean;
}

export function ChatMessage({ role, content, isLatest }: ChatMessageProps) {
  const isBot = role === "assistant";

  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-in",
        isBot ? "" : "flex-row-reverse"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border",
          isBot
            ? "bg-surface-1 border-border/40"
            : "bg-primary/10 border-primary/20"
        )}
      >
        {isBot ? (
          <Sparkles className="h-4 w-4 text-primary" />
        ) : (
          <User className="h-4 w-4 text-primary" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn("flex-1 min-w-0 max-w-[85%]", !isBot && "flex flex-col items-end")}>
        <div
          className={cn(
            "inline-block rounded-xl px-4 py-2.5 border",
            isBot
              ? "bg-surface-1 border-border/30 rounded-tl-sm text-left"
              : "bg-gradient-to-br from-primary to-blue-500 text-white border-transparent rounded-tr-sm"
          )}
        >
          {isBot ? (
            <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 leading-relaxed">
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p className="mb-2 last:mb-0 text-sm leading-relaxed">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-4 mb-2 text-sm space-y-1">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-4 mb-2 text-sm space-y-1">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed">{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-foreground">{children}</strong>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      className="text-primary hover:underline transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                  code: ({ children }) => (
                    <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
                      {children}
                    </code>
                  ),
                  h1: ({ children }) => (
                    <h1 className="text-base font-semibold mb-2 mt-3 first:mt-0 text-foreground">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-sm font-semibold mb-2 mt-3 first:mt-0 text-foreground">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-medium mb-1 mt-2 first:mt-0 text-foreground">{children}</h3>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-primary/40 pl-3 my-2 italic text-muted-foreground">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm leading-relaxed">{content}</p>
          )}
        </div>
      </div>
    </div>
  );
}
