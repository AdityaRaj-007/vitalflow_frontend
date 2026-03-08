import { useEffect, useState } from 'react'
import Icon from '../ui/Icon'

export default function Header({ title, subtitle, actions }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <div className="flex flex-wrap justify-between items-start gap-4 mb-6 md:mb-8">
      <div className="min-w-0">
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-cream tracking-tight leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-slate text-xs sm:text-sm mt-1 leading-snug">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <button
          onClick={toggleTheme}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-cream/5 border border-cream/10 text-slate hover:bg-cream/10 hover:text-cream transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={20} />
        </button>
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
    </div>
  )
}
