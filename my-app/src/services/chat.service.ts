/**
 * Chat Service
 * Handles communication with the AI chatbot backend
 */

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface SuggestedPrompt {
  text: string;
  category: string; // e.g., "hoodie", "tshirt", "mug"
  theme: string; // e.g., "minimalist", "artistic", "vintage"
}

export interface ChatResponse {
  message: string;
  suggested_prompts: SuggestedPrompt[];
  suggested_actions: string[];
}

export interface ChatRequest {
  message: string;
  context: ChatMessage[];
  user_context?: Record<string, any>;
}

class ChatService {
  private baseUrl = process.env.NEXT_PUBLIC_AI_API_URL || "http://localhost:8000";
  private retryCount = 3;
  private retryDelay = 1000; // ms

  /**
   * Send a message to the chatbot and get a response
   */
  async sendMessage(
    userMessage: string,
    conversationHistory: ChatMessage[] = [],
    userContext?: Record<string, any>
  ): Promise<ChatResponse> {
    const request: ChatRequest = {
      message: userMessage,
      context: conversationHistory,
      user_context: userContext || {},
    };

    try {
      const response = await this.fetchWithRetry(
        `${this.baseUrl}/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        },
        this.retryCount
      );

      if (!response.ok) {
        throw new Error(`Chat API error: ${response.status}`);
      }

      const data: ChatResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Chat service error:", error);
      // Return a fallback response
      return {
        message: "I'm having trouble connecting to the chat service. Please try again.",
        suggested_prompts: [],
        suggested_actions: [],
      };
    }
  }

  /**
   * Validate a design prompt
   */
  async validatePrompt(prompt: string): Promise<{
    valid: boolean;
    label: string;
    explanation: string;
  }> {
    try {
      const response = await this.fetchWithRetry(
        `${this.baseUrl}/check-prompt`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: prompt }),
        }
      );

      if (!response.ok) {
        throw new Error(`Validation API error: ${response.status}`);
      }

      const data = await response.json();
      const responseText = String(data.response || '').trim().toLowerCase();
      const isValid = responseText.startsWith('valid');
      const explanation = responseText.includes(',')
        ? responseText.split(',', 2)[1].trim()
        : isValid
          ? 'Prompt looks good'
          : 'Prompt was rejected';

      return {
        valid: isValid,
        label: responseText.split(',', 1)[0] || 'valid',
        explanation,
      };
    } catch (error) {
      console.error("Prompt validation error:", error);
      return {
        valid: true,
        label: "valid",
        explanation: "Validation skipped",
      };
    }
  }

  /**
   * Extract design trends from text
   */
  async extractTrend(text: string): Promise<string> {
    try {
      const response = await this.fetchWithRetry(
        `${this.baseUrl}/extract-trend`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
        }
      );

      if (!response.ok) {
        throw new Error(`Trend extraction error: ${response.status}`);
      }

      const data = await response.json();
      return data.trend || text;
    } catch (error) {
      console.error("Trend extraction error:", error);
      return text;
    }
  }

  /**
   * Fetch with automatic retry logic
   */
  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    retries = 3
  ): Promise<Response> {
    let lastError: any;

    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        return response;
      } catch (error) {
        lastError = error;
        if (i < retries - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, this.retryDelay * (i + 1))
          );
        }
      }
    }

    throw lastError;
  }

  /**
   * Get design suggestions based on product type and preferences
   */
  async getDesignSuggestions(
    productType: string,
    preferredColors: string[] = [],
    designStyle: string = "",
    count: number = 6
  ): Promise<string[]> {
    try {
      const response = await this.fetchWithRetry(
        `${this.baseUrl}/suggest-designs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product_type: productType,
            preferred_colors: preferredColors,
            design_style: designStyle,
            count,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Design suggestions error: ${response.status}`);
      }

      const data = await response.json();
      return data.suggestions || [];
    } catch (error) {
      console.error("Design suggestions error:", error);
      return [];
    }
  }
}

export const chatService = new ChatService();
