export interface VoiceCommandResult {
  type: 'navigate' | 'logout' | 'none';
  label?: string;
  path?: string;
}

function normalizeVoiceText(text: string): string {
  return text.toLowerCase().trim().replace(/[\.,!?]/g, ' ');
}

export function resolveVoiceCommand(text: string): VoiceCommandResult {
  const normalized = normalizeVoiceText(text);

  const commandMap: Array<{ pattern: RegExp; path: string; label: string }> = [
    { pattern: /\b(log out|logout|sign out|sign me out|log me out)\b/, path: '/login', label: 'Logout' },
    { pattern: /\b(open|go to|show|navigate to|take me to)\s+(the\s+)?mockups?( page)?\b/, path: '/mockup-request', label: 'Mockups' },
    { pattern: /\b(open|go to|show|navigate to|take me to)\s+(the\s+)?design( studio)?( page)?\b/, path: '/design', label: 'Design Studio' },
    { pattern: /\b(open|go to|show|navigate to|take me to)\s+(the\s+)?home(page)?\b/, path: '/home', label: 'Home' },
    { pattern: /\b(open|go to|show|navigate to|take me to)\s+(the\s+)?products?( page)?\b/, path: '/products', label: 'Products' },
    { pattern: /\b(open|go to|show|navigate to|take me to)\s+(the\s+)?templates?( page)?\b/, path: '/templates', label: 'Templates' },
    { pattern: /\b(open|go to|show|navigate to|take me to)\s+(the\s+)?cart\b/, path: '/cart', label: 'Cart' },
    { pattern: /\b(open|go to|show|navigate to|take me to)\s+(the\s+)?orders?( page)?\b/, path: '/orders', label: 'Orders' },
    { pattern: /\b(open|go to|show|navigate to|take me to)\s+(the\s+)?profile( page)?\b/, path: '/profile', label: 'Profile' },
    { pattern: /\b(open|go to|show|navigate to|take me to)\s+(the\s+)?community( page)?\b/, path: '/community', label: 'Community' },
  ];

  for (const command of commandMap) {
    if (command.pattern.test(normalized)) {
      if (command.label === 'Logout') {
        return {
          type: 'logout',
          label: command.label,
          path: command.path,
        };
      }

      return {
        type: 'navigate',
        path: command.path,
        label: command.label,
      };
    }
  }

  return { type: 'none' };
}

export function looksLikeNavigationCommand(text: string): boolean {
  return resolveVoiceCommand(text).type === 'navigate';
}
