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
        "flex gap-3 py-2 animate-fade-in",
        isBot ? "" : "flex-row-reverse"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center",
          isBot
            ? "bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-violet-500/20"
            : "bg-primary/15"
        )}
      >
        {isBot ? (
          <Sparkles className="h-4 w-4 text-purple-400" />
        ) : (
          <User className="h-4 w-4 text-primary" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn("flex-1 min-w-0", !isBot && "text-right")}>
        <div className="text-xs font-medium text-muted-foreground mb-1.5">
          {isBot ? "Bookie AI" : "You"}
        </div>
        <div
          className={cn(
            "inline-block rounded-2xl px-4 py-3 max-w-[85%]",
            isBot
              ? "bg-muted/50 rounded-tl-md text-left"
              : "bg-gradient-to-br from-pink-500/90 via-purple-500/90 to-violet-600/90 text-white rounded-tr-md"
          )}
        >
          {isBot ? (
            <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 leading-relaxed">
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p className="mb-2 last:mb-0 text-sm">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-4 mb-2 text-sm">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-4 mb-2 text-sm">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="mb-1">{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-foreground">{children}</strong>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      className="text-purple-400 hover:text-purple-300 hover:underline transition-colors"
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
                    <h1 className="text-base font-semibold mb-2 mt-3 first:mt-0">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-sm font-semibold mb-2 mt-3 first:mt-0">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-medium mb-1 mt-2 first:mt-0">{children}</h3>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-purple-400/50 pl-3 my-2 italic text-muted-foreground">
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
