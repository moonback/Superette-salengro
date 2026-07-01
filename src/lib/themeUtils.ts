/**
 * Utility functions and class names for dark mode support
 */

/**
 * Common class combinations for dark mode
 */
export const themeClasses = {
  // Text colors
  text: {
    primary: 'text-stone-900 dark:text-stone-100',
    secondary: 'text-stone-600 dark:text-stone-400',
    muted: 'text-stone-400 dark:text-stone-500',
    link: 'text-indigo-600 dark:text-indigo-400',
  },

  // Background colors
  bg: {
    primary: 'bg-white dark:bg-stone-900',
    secondary: 'bg-stone-50 dark:bg-stone-800',
    elevated: 'bg-white dark:bg-stone-800',
    hover: 'hover:bg-stone-100 dark:hover:bg-stone-700',
  },

  // Border colors
  border: {
    default: 'border-stone-200 dark:border-stone-700',
    light: 'border-stone-200/60 dark:border-stone-700/60',
    focus: 'focus:border-indigo-400 dark:focus:border-indigo-500',
  },

  // Card styles
  card: 'rounded-2xl border border-stone-200/60 dark:border-stone-700/60 bg-white dark:bg-stone-900 p-4 shadow-sm',

  // Button styles
  button: {
    primary: 'bg-indigo-600 dark:bg-indigo-700 text-white hover:bg-indigo-500 dark:hover:bg-indigo-600',
    secondary: 'bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-stone-100 hover:bg-stone-300 dark:hover:bg-stone-600',
    danger: 'bg-rose-600 dark:bg-rose-700 text-white hover:bg-rose-500 dark:hover:bg-rose-600',
  },

  // Input styles
  input: 'border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-500',

  // Badge/pill styles
  badge: {
    default: 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300',
    primary: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300',
    success: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300',
    warning: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
    danger: 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300',
  },

  // Divider
  divider: 'border-stone-200 dark:border-stone-700',
};

/**
 * Generate conditional dark mode classes
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
