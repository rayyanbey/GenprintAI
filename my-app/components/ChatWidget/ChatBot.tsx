"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChatMessage as ChatMessageComponent } from "./ChatMessage";
import { chatService, ChatMessage, SuggestedPrompt } from "@/src/services/chat.service";
import { X, Send, MessageCircle } from "lucide-react";

interface ChatBotProps {
  onPromptSelected?: (prompt: SuggestedPrompt) => void;
  productType?: string;
  preferredColors?: string[];
}

interface ExtendedChatMessage extends ChatMessage {
  suggestedPrompts?: SuggestedPrompt[];
}

export const ChatBot: React.FC<ChatBotProps> = ({
  onPromptSelected,
  productType,
  preferredColors,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    // Add user message to chat
    const userMessage: ChatMessage = {
      role: "user",
      content: inputValue,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      // Get response from chatbot service (pass updated messages)
      const response = await chatService.sendMessage(
        inputValue,
        updatedMessages,
        {
          productType,
          preferredColors,
        }
      );

      // Add assistant message with suggested prompts attached
      const assistantMessage: ExtendedChatMessage = {
        role: "assistant",
        content: response.message,
        suggestedPrompts: response.suggested_prompts || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptSelect = (prompt: SuggestedPrompt) => {
    if (onPromptSelected) {
      onPromptSelected(prompt);
    }
    // Optionally close the chat
    setIsOpen(false);
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  if (!isOpen) {
    // Floating button
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-[#f4978e] hover:bg-[#f08080] text-white rounded-full shadow-lg hover:shadow-xl transition-all p-4 z-40 hover:scale-110 transform"
        aria-label="Open chat"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  // Chat window
  return (
    <div className="fixed bottom-6 right-6 w-96 max-h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div className="bg-[#f4978e] text-white p-4 rounded-t-lg flex justify-between items-center">
        <h3 className="font-semibold text-lg">Design Assistant</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:bg-[#f08080] p-1 rounded transition-colors"
          aria-label="Close chat"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center text-gray-500">
            <div>
              <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                Hi! I'm your design assistant. Tell me what you'd like to create!
              </p>
              <p className="text-xs mt-2 opacity-70">
                e.g., "Dark hoodie for winter"
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <ChatMessageComponent
                key={index}
                role={msg.role}
                content={msg.content}
                suggestedPrompts={msg.suggestedPrompts}
                onPromptSelect={handlePromptSelect}
              />
            ))}
            {isLoading && (
              <ChatMessageComponent
                role="assistant"
                content="Thinking..."
                isLoading={true}
              />
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-3 rounded-b-lg">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Describe your design..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f4978e] text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="px-4 py-2 bg-[#f4978e] hover:bg-[#f08080] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
          >
            Send
          </button>
        </form>
        <div className="flex justify-between items-center mt-2 px-1">
          <p className="text-xs text-gray-500">
            Press Enter or click Send
          </p>
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear chat
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
