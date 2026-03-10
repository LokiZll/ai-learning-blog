export const CATEGORIES = {
  'ai-basics': {
    label: 'AI 基础',
    description: 'AI 基础概念与入门知识',
    icon: '📚',
    color: {
      border: 'border-l-cat-basics',
      bg: 'bg-cat-basics-light dark:bg-cat-basics-dark',
      text: 'text-indigo-700 dark:text-indigo-300',
      badge: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
      badgeHover: 'hover:bg-indigo-200 dark:hover:bg-indigo-900/50',
      accent: 'bg-cat-basics',
    },
  },
  'prompt-engineering': {
    label: '提示工程',
    description: '提示词设计与优化技巧',
    icon: '✨',
    color: {
      border: 'border-l-cat-prompt',
      bg: 'bg-cat-prompt-light dark:bg-cat-prompt-dark',
      text: 'text-violet-700 dark:text-violet-300',
      badge: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
      badgeHover: 'hover:bg-violet-200 dark:hover:bg-violet-900/50',
      accent: 'bg-cat-prompt',
    },
  },
  'ai-tools': {
    label: 'AI 工具',
    description: 'AI 工具使用指南与评测',
    icon: '🛠️',
    color: {
      border: 'border-l-cat-tools',
      bg: 'bg-cat-tools-light dark:bg-cat-tools-dark',
      text: 'text-teal-700 dark:text-teal-300',
      badge: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
      badgeHover: 'hover:bg-teal-200 dark:hover:bg-teal-900/50',
      accent: 'bg-cat-tools',
    },
  },
  'case-studies': {
    label: '实战案例',
    description: '真实项目中的 AI 应用案例',
    icon: '🚀',
    color: {
      border: 'border-l-cat-cases',
      bg: 'bg-cat-cases-light dark:bg-cat-cases-dark',
      text: 'text-amber-700 dark:text-amber-300',
      badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      badgeHover: 'hover:bg-amber-200 dark:hover:bg-amber-900/50',
      accent: 'bg-cat-cases',
    },
  },
  'claude-code': {
    label: 'Claude Code',
    description: 'Claude Code 使用技巧与开发实践',
    icon: '🤖',
    color: {
      border: 'border-l-cat-claude',
      bg: 'bg-cat-claude-light dark:bg-cat-claude-dark',
      text: 'text-rose-700 dark:text-rose-300',
      badge: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
      badgeHover: 'hover:bg-rose-200 dark:hover:bg-rose-900/50',
      accent: 'bg-cat-claude',
    },
  },
} as const;

export type Category = keyof typeof CATEGORIES;
