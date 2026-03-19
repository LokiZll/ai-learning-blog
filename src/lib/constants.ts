// 共享常量

export const POSTS_PER_PAGE = 15;

export const SERIES_COLORS: Record<string, { bg: string; darkBg: string; border: string; darkBorder: string; text: string; darkText: string }> = {
  rose: { bg: 'bg-rose-50', darkBg: 'dark:bg-rose-900/20', border: 'border-l-rose-400', darkBorder: 'dark:border-l-rose-600', text: 'text-rose-700', darkText: 'dark:text-rose-300' },
  violet: { bg: 'bg-violet-50', darkBg: 'dark:bg-violet-900/20', border: 'border-l-violet-400', darkBorder: 'dark:border-l-violet-600', text: 'text-violet-700', darkText: 'dark:text-violet-300' },
  blue: { bg: 'bg-blue-50', darkBg: 'dark:bg-blue-900/20', border: 'border-l-blue-400', darkBorder: 'dark:border-l-blue-600', text: 'text-blue-700', darkText: 'dark:text-blue-300' },
  teal: { bg: 'bg-teal-50', darkBg: 'dark:bg-teal-900/20', border: 'border-l-teal-400', darkBorder: 'dark:border-l-teal-600', text: 'text-teal-700', darkText: 'dark:text-teal-300' },
  indigo: { bg: 'bg-indigo-50', darkBg: 'dark:bg-indigo-900/20', border: 'border-l-indigo-400', darkBorder: 'dark:border-l-indigo-600', text: 'text-indigo-700', darkText: 'dark:text-indigo-300' },
  amber: { bg: 'bg-amber-50', darkBg: 'dark:bg-amber-900/20', border: 'border-l-amber-400', darkBorder: 'dark:border-l-amber-600', text: 'text-amber-700', darkText: 'dark:text-amber-300' },
};
