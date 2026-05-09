import React from "react";
import { SuggestedPrompt } from "@/src/services/chat.service";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  suggestedPrompts?: SuggestedPrompt[];
  onPromptSelect?: (prompt: SuggestedPrompt) => void;
  isLoading?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  suggestedPrompts,
  onPromptSelect,
  isLoading = false,
}) => {
  const isUser = role === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 animate-fade-in`}
    >
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isUser
            ? "bg-[#f4978e] text-white rounded-br-none"
            : "bg-gray-200 text-gray-800 rounded-bl-none"
        }`}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="animate-bounce w-2 h-2 bg-current rounded-full"></div>
            <div className="animate-bounce w-2 h-2 bg-current rounded-full delay-100"></div>
            <div className="animate-bounce w-2 h-2 bg-current rounded-full delay-200"></div>
          </div>
        ) : (
          <p className="text-sm leading-relaxed">{content}</p>
        )}

        {/* Suggested Prompts */}
        {suggestedPrompts && suggestedPrompts.length > 0 && (
          <div className="mt-3 space-y-2">
            {suggestedPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => onPromptSelect?.(prompt)}
                className={`block w-full text-left px-3 py-2 rounded text-xs transition-colors ${
                  isUser
                    ? "bg-[#f08080] hover:bg-[#f06060]"
                    : "bg-[#f4978e] text-white hover:bg-[#f08080]"
                }`}
              >
                <div className="font-semibold mb-1">
                  {prompt.theme} • {prompt.category}
                </div>
                <div className="text-xs opacity-90">{prompt.text}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
