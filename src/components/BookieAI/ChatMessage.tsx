 import ReactMarkdown from "react-markdown";
 import remarkMath from "remark-math";
 import rehypeKatex from "rehype-katex";
 import "katex/dist/katex.min.css";
import { Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  isLatest?: boolean;
}

export function ChatMessage({ role, content, imageUrl, isLatest }: ChatMessageProps) {
  const isBot = role === "assistant";

   // Prepare content for proper rendering
   let processedContent = content
     // Ensure proper spacing around block math
     .replace(/\$\$\s*/g, '\n$$')
     .replace(/\s*\$\$/g, '$$\n')
     // Clean up triple asterisks
     .replace(/\*\*\*/g, '**')
     // Replace horizontal rules with em dash
     .replace(/---/g, '—')
     .trim();
   
   // Fix inline heading syntax - convert mid-line ### to bold
   // Match heading markers that are NOT at the start of a line
   processedContent = processedContent
     // Convert inline ### heading to **bold**
     .replace(/([^\n])#{1,6}\s+([^\n]+)/g, '$1**$2**')
     // Ensure headings at start of line are properly formatted
     .replace(/^(#{1,6})\s*$/gm, '') // Remove empty headings
     .replace(/^(#{1,6})([^\s#])/gm, '$1 $2'); // Add space after # if missing

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
        {/* Image attachment (shown above text for user messages) */}
        {imageUrl && !isBot && (
          <div className="mb-2 rounded-xl overflow-hidden border border-primary/20 max-w-[200px]">
            <img 
              src={imageUrl} 
              alt="Uploaded image" 
              className="w-full h-auto object-cover"
            />
          </div>
        )}
        
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
               remarkPlugins={[remarkMath]}
               rehypePlugins={[rehypeKatex]}
                components={{
                  // Paragraphs
                  p: ({ children }) => (
                   <p className="mb-3 last:mb-0 text-sm leading-relaxed [&_.katex]:text-[0.95em]">{children}</p>
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
                 // Math display - ensure proper styling
                 span: ({ className, children, ...props }) => {
                   if (className?.includes('katex')) {
                     return (
                       <span 
                         className={cn(className, "text-foreground")} 
                         {...props}
                       >
                         {children}
                       </span>
                     );
                   }
                   return <span className={className} {...props}>{children}</span>;
                 },
                 div: ({ className, children, ...props }) => {
                   if (className?.includes('katex')) {
                     return (
                       <div 
                         className={cn(className, "my-3 overflow-x-auto text-foreground")} 
                         {...props}
                       >
                         {children}
                       </div>
                     );
                   }
                   return <div className={className} {...props}>{children}</div>;
                 },
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
               {processedContent}
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
