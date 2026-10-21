import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BOOKIE_AI_SYSTEM_PROMPT } from "@/lib/bookieAiPrompt";
import { generateBookieAIResponse } from "@/lib/bookieAiEngine";

type MessageContent = 
  | string 
  | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }>;

export type Message = { 
  role: "user" | "assistant" | "system"; 
  content: MessageContent;
  displayContent?: string;
  imageUrl?: string;
};

const SUPABASE_CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bookie-chat`;
const OPENROUTER_DIRECT_URL = "https://openrouter.ai/api/v1/chat/completions";

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content: "Hi 👋 I'm Bookie AI — your personal JEE study mentor. Ask me concept doubts, exam strategy, or find any study material 📚💪",
  displayContent: "Hi 👋 I'm Bookie AI — your personal JEE study mentor. Ask me concept doubts, exam strategy, or find any study material 📚💪",
};

async function streamLocalFallback(
  text: string, 
  onChunk: (chunk: string) => void
): Promise<void> {
  const parts = text.split(/(\s+)/);
  for (const part of parts) {
    if (!part) continue;
    onChunk(part);
    await new Promise((resolve) => setTimeout(resolve, 14));
  }
}

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
      const contentParts: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> = [];
      
      contentParts.push({
        type: "image_url",
        image_url: { url: imageBase64 }
      });
      
      const textContent = input.trim() || "Please analyze this image, identify the question or concept, and solve it step-by-step.";
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
      // Filter out greeting message
      const conversationHistory = [...messages, userMsg]
        .filter(m => m !== INITIAL_MESSAGE)
        .map(m => ({
          role: m.role,
          content: m.content
        }));

      // Check if direct OpenRouter API key is configured in client environment
      const clientOpenRouterKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      const clientOpenRouterModel = import.meta.env.VITE_OPENROUTER_MODEL || "google/gemini-2.0-flash-001";

      let response: Response | null = null;

      if (clientOpenRouterKey && clientOpenRouterKey.trim() !== "") {
        // Direct OpenRouter Client Mode
        try {
          response = await fetch(OPENROUTER_DIRECT_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${clientOpenRouterKey.trim()}`,
              "HTTP-Referer": window.location.origin,
              "X-Title": "Bookie AI",
            },
            body: JSON.stringify({
              model: clientOpenRouterModel.trim(),
              messages: [
                { role: "system", content: BOOKIE_AI_SYSTEM_PROMPT },
                ...conversationHistory,
              ],
              stream: true,
            }),
          });
        } catch (_fetchErr) {
          response = null;
        }
      }

      if (!response || !response.ok) {
        // Edge Function Backend Mode (Works for Guest, Email, and Google)
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const accessToken = sessionData.session?.access_token;
          
          // Guests use the anon publishable key; authenticated users (Email, Google) use their session token
          const authHeader = accessToken 
            ? `Bearer ${accessToken}` 
            : `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`;

          response = await fetch(SUPABASE_CHAT_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              Authorization: authHeader,
            },
            body: JSON.stringify({ messages: conversationHistory }),
          });
        } catch (_edgeErr) {
          response = null;
        }
      }

      // If backend network request succeeded and returned a streamable body
      if (response && response.ok && response.body) {
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
          for (const raw of buffer.split("\n")) {
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
      } else {
        // Universal Built-in Study Mentor Fallback:
        // Guarantees zero failures for every student (Guest, Email, Google)
        const fallbackAnswer = generateBookieAIResponse({
          prompt: input,
          hasImage: !!imageBase64,
          history: conversationHistory
        });
        await streamLocalFallback(fallbackAnswer, updateAssistant);
      }
    } catch (err) {
      console.warn("Bookie AI fallback triggered:", err);
      // Safe fallback stream in case of any unexpected runtime issue
      const fallbackAnswer = generateBookieAIResponse({
        prompt: input,
        hasImage: !!imageBase64
      });
      await streamLocalFallback(fallbackAnswer, updateAssistant);
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
