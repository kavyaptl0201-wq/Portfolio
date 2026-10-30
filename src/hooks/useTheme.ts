export type Theme = 'dark';

export function useTheme(_defaultTheme: string = 'dark') {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.add('dark');
  }

  return {
    theme: 'dark' as const,
    resolvedTheme: 'dark' as const,
    setTheme: () => {},
    toggleTheme: () => {},
  };
}
