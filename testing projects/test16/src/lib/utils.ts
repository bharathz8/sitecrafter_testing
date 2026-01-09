// Utility functions for className merging
// This cn function works standalone without any dependencies

/**
 * Combines class names conditionally
 * @example cn('base', isActive && 'active', className)
 */
export function cn(...inputs: (string | boolean | undefined | null)[]): string {
  return inputs.filter(Boolean).join(' ');
}

/**
 * Format currency values
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format date values
 */
export function formatDate(date: Date | string): string {
  // The error "TypeError: nTimeout is not a function" observed during Vite server restarts/HMR
  // in environments like WebContainers often suggests an issue within the underlying
  // NodeJS/Vite timing mechanisms (like timers being improperly cleaned up) rather than
  // the application code itself.
  // The error message points to something called 'nTimeout' which is NOT a standard function in this file.
  // This indicates the error is likely coming from Vite's HMR/Timer machinery being interrupted,
  // often related to how module updates are handled during rapid restarts (which can happen
  // when saving utility files).

  // The code below is standard and safe. Since the error points outside this logic,
  // the fix here must involve making the function execution as synchronous and robust as possible
  // or ensuring no unexpected side effects occur during initialization, although the HMR timeout is
  // usually an environment problem. We proceed with the robust date handling already present.

  let dateObj: Date;
  if (date instanceof Date) {
    dateObj = date;
  } else {
    // If it's a string, this is standard parsing.
    dateObj = new Date(date);
  }
  
  // A secondary defense against potential issues when Date construction might fail or yield an invalid date
  if (isNaN(dateObj.getTime())) {
      // Returning an empty string is often safer for formatting utilities during build/HMR instability.
      return ''; 
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}