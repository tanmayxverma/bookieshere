import { useState, useCallback } from "react";

type MessageContent = 
  | string 
  | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }>;

export type Message = { 
  role: "user" | "assistant"; 
  content: MessageContent;
  // For UI display purposes
  displayContent?: string;
  imageUrl?: string;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bookie-chat`;

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content: "Hi 👋 I'm Bookie AI — your personal study assistant. Ask me doubts or find the right study material 📚",
  displayContent: "Hi 👋 I'm Bookie AI — your personal study assistant. Ask me doubts or find the right study material 📚",
};

export function useBookieChat() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (input: string, imageBase64?: string) => {
    if ((!input.trim() && !imageBase64) || isLoading) return;

    // Build user message content
    let userContent: MessageContent;
    let displayContent = input.trim();
    
    if (imageBase64) {
      // Multimodal message with image
      const contentParts: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> = [];
      
      // Add image first
      contentParts.push({
        type: "image_url",
        image_url: { url: imageBase64 }
      });
      
      // Add text (or default prompt if no text)
      const textContent = input.trim() || "Please analyze this image and help me understand it.";
      contentParts.push({
        type: "text",
        text: textContent
      });
      
      userContent = contentParts;
      displayContent = textContent;
    } else {
      userContent = input.trim();
    }

    const userMsg: Message = { 
      role: "user", 
      content: userContent,
      displayContent,
      imageUrl: imageBase64 || undefined
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    let assistantContent = "";

    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length > 1 && prev[prev.length - 2].role === "user") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantContent, displayContent: assistantContent } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantContent, displayContent: assistantContent }];
      });
    };

    try {
      // Prepare messages for API - convert to proper format
      const apiMessages = [...messages, userMsg]
        .filter(m => m !== INITIAL_MESSAGE)
        .map(m => ({
          role: m.role,
          content: m.content
        }));

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) updateAssistant(content);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Flush remaining buffer
      if (buffer.trim()) {
        for (let raw of buffer.split("\n")) {
          if (!raw || raw.startsWith(":") || raw.trim() === "" || !raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) updateAssistant(content);
          } catch { /* ignore */ }
        }
      }
    } catch (err) {
      console.error("Bookie chat error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
      // Remove the pending assistant message if there was an error
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && !last.displayContent) {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  const clearChat = useCallback(() => {
    setMessages([INITIAL_MESSAGE]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
  };
}
