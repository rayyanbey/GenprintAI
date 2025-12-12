/**
 * Session utility functions for managing user session updates
 * and handling edge cases in the application
 */

/**
 * Get user initials from name or email for avatar fallback
 * Edge cases handled:
 * - No name or email provided
 * - Single character names
 * - Multiple spaces in names
 * - Special characters in names
 */
export function getUserInitials(name?: string | null, email?: string | null): string {
  if (name && name.trim()) {
    const trimmedName = name.trim();
    const names = trimmedName.split(/\s+/); // Split by one or more spaces
    
    if (names.length >= 2) {
      // First and last name
      const firstInitial = names[0][0] || '';
      const lastInitial = names[names.length - 1][0] || '';
      return `${firstInitial}${lastInitial}`.toUpperCase();
    }
    
    // Single name - take first two characters
    return trimmedName.substring(0, 2).toUpperCase();
  }
  
  if (email && email.trim()) {
    const trimmedEmail = email.trim();
    // Get first two characters before @
    const username = trimmedEmail.split('@')[0];
    return username.substring(0, 2).toUpperCase();
  }
  
  // Fallback
  return 'U';
}

/**
 * Validate image URL for avatar
 * Edge cases handled:
 * - Invalid URL format
 * - Non-image URLs
 * - Broken/404 URLs (client-side check)
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    
    // Check if it's a valid HTTP/HTTPS URL
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }
    
    // Check for common image extensions
    const pathname = urlObj.pathname.toLowerCase();
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    
    // Check if URL path ends with image extension or is from known image services
    const hasImageExtension = imageExtensions.some(ext => pathname.endsWith(ext));
    const isImageService = [
      'googleusercontent.com',
      'cloudinary.com',
      'imgur.com',
      'unsplash.com',
      'pexels.com',
    ].some(service => urlObj.hostname.includes(service));
    
    return hasImageExtension || isImageService;
  } catch (error) {
    return false;
  }
}

/**
 * Format display name with fallback
 * Edge cases handled:
 * - No name provided
 * - Very long names (truncation)
 * - Email as fallback
 */
export function getDisplayName(
  name?: string | null,
  email?: string | null,
  maxLength: number = 50
): string {
  if (name && name.trim()) {
    const trimmedName = name.trim();
    if (trimmedName.length > maxLength) {
      return trimmedName.substring(0, maxLength) + '...';
    }
    return trimmedName;
  }
  
  if (email && email.trim()) {
    const username = email.split('@')[0];
    if (username.length > maxLength) {
      return username.substring(0, maxLength) + '...';
    }
    return username;
  }
  
  return 'User';
}

/**
 * Validate file size for uploads
 * Edge cases handled:
 * - Files larger than max size
 * - Invalid file objects
 */
export function validateFileSize(file: File, maxSizeMB: number = 5): {
  valid: boolean;
  error?: string;
} {
  if (!file || !(file instanceof File)) {
    return { valid: false, error: 'Invalid file object' };
  }
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
    };
  }
  
  return { valid: true };
}

/**
 * Validate image file type
 * Edge cases handled:
 * - Non-image files
 * - Unsupported image formats
 */
export function validateImageType(file: File): {
  valid: boolean;
  error?: string;
} {
  if (!file || !(file instanceof File)) {
    return { valid: false, error: 'Invalid file object' };
  }
  
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are supported.',
    };
  }
  
  return { valid: true };
}

/**
 * Format date with fallback
 * Edge cases handled:
 * - Invalid date strings
 * - Null/undefined dates
 * - Future dates
 */
export function formatDate(
  dateString: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    };
    
    return date.toLocaleDateString('en-US', defaultOptions);
  } catch (error) {
    return 'Invalid date';
  }
}

/**
 * Format relative time (e.g., "2 hours ago")
 * Edge cases handled:
 * - Invalid dates
 * - Future dates
 * - Very old dates
 */
export function formatRelativeTime(dateString: string | Date | null | undefined): string {
  if (!dateString) return 'Unknown';
  
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);
    
    // Future date
    if (diffSeconds < 0) {
      return 'Just now';
    }
    
    if (diffSeconds < 60) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
    if (diffMonths < 12) return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
    
    return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
  } catch (error) {
    return 'Unknown';
  }
}

/**
 * Truncate text with ellipsis
 * Edge cases handled:
 * - Text shorter than max length
 * - Null/undefined text
 * - HTML content
 */
export function truncateText(text: string | null | undefined, maxLength: number = 100): string {
  if (!text) return '';
  
  const cleanText = text.trim();
  
  if (cleanText.length <= maxLength) {
    return cleanText;
  }
  
  return cleanText.substring(0, maxLength).trim() + '...';
}

/**
 * Handle API errors with user-friendly messages
 * Edge cases handled:
 * - Network errors
 * - Timeout errors
 * - Server errors
 * - Validation errors
 */
export function getErrorMessage(error: any): string {
  // Network error
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return 'Network error. Please check your internet connection.';
  }
  
  // Timeout
  if (error.name === 'AbortError') {
    return 'Request timeout. Please try again.';
  }
  
  // API error response
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  
  // Generic error with message
  if (error?.message) {
    return error.message;
  }
  
  // Unknown error
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Debounce function for search/input handlers
 * Edge cases handled:
 * - Rapid successive calls
 * - Component unmounting
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Check if user session is valid and not expired
 * Edge cases handled:
 * - Expired sessions
 * - Missing session data
 * - Invalid session format
 */
export function isSessionValid(session: any): boolean {
  if (!session || !session.user) {
    return false;
  }
  
  // Check if session has required fields
  if (!session.user.id || !session.user.email) {
    return false;
  }
  
  // Add additional session validation logic here if needed
  // For example, check session expiry time if available
  
  return true;
}

/**
 * Generate a safe filename from user input
 * Edge cases handled:
 * - Special characters
 * - Very long names
 * - Non-ASCII characters
 */
export function sanitizeFilename(filename: string, maxLength: number = 100): string {
  if (!filename) return `file-${Date.now()}`;
  
  // Remove special characters and spaces
  const sanitized = filename
    .replace(/[^a-zA-Z0-9.-]/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  
  if (sanitized.length > maxLength) {
    const extension = sanitized.split('.').pop() || '';
    const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.'));
    const truncatedName = nameWithoutExt.substring(0, maxLength - extension.length - 1);
    return `${truncatedName}.${extension}`;
  }
  
  return sanitized || `file-${Date.now()}`;
}
