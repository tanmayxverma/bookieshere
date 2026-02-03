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

  // Clean content - ensure no raw markdown breaks through
  const cleanContent = content
    .replace(/\*\*\*/g, '') // Remove triple asterisks
    .replace(/---/g, '—'); // Replace horizontal rules with em dash

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
            "inline-block rounded-xl px-4 py-3 border",
            isBot
              ? "bg-surface-1 border-border/30 rounded-tl-sm text-left"
              : "bg-gradient-to-br from-primary to-blue-500 text-white border-transparent rounded-tr-sm"
          )}
        >
          {isBot ? (
            <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 leading-relaxed">
              <ReactMarkdown
                components={{
                  // Paragraphs
                  p: ({ children }) => (
                    <p className="mb-3 last:mb-0 text-sm leading-relaxed">{children}</p>
                  ),
                  // Lists
                  ul: ({ children }) => (
                    <ul className="list-disc pl-4 mb-3 text-sm space-y-1.5">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-4 mb-3 text-sm space-y-1.5">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed pl-1">{children}</li>
                  ),
                  // Text formatting
                  strong: ({ children }) => (
                    <strong className="font-semibold text-foreground">{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-foreground/80">{children}</em>
                  ),
                  // Links
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      className="text-primary hover:underline transition-colors font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                  // Code
                  code: ({ children, className }) => {
                    const isInline = !className;
                    return isInline ? (
                      <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-foreground">
                        {children}
                      </code>
                    ) : (
                      <code className="block bg-muted p-3 rounded-lg text-xs font-mono overflow-x-auto my-2">
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children }) => (
                    <pre className="bg-muted rounded-lg overflow-x-auto my-2 text-foreground">
                      {children}
                    </pre>
                  ),
                  // Headings
                  h1: ({ children }) => (
                    <h1 className="text-base font-bold mb-2 mt-4 first:mt-0 text-foreground">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-sm font-bold mb-2 mt-3 first:mt-0 text-foreground">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-semibold mb-1.5 mt-2 first:mt-0 text-foreground">{children}</h3>
                  ),
                  // Blockquote
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-primary/40 pl-3 my-3 text-muted-foreground italic">
                      {children}
                    </blockquote>
                  ),
                  // Horizontal rule
                  hr: () => (
                    <hr className="my-3 border-border/50" />
                  ),
                }}
              >
                {cleanContent}
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
