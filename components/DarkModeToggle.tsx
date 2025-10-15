'use client';

import { useEffect, useState } from 'react';

export default function DarkModeToggle() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      setMode('dark');
      document.documentElement.classList.add('dark');
    } else {
      setMode('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    if (mode === 'light') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setMode('dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setMode('light');
    }
  };

  return (
    <div className="">
      <button
        onClick={toggleDarkMode}
        className="rounded-full h-9 w-9 flex items-center justify-center 
                   bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                   hover:bg-gray-300 dark:hover:bg-gray-600 transition shadow-md border border-gray-300 dark:border-gray-600"
        title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
        style={{ fontSize: 22 }}
      >
        {mode === 'light' ? (
          <span className="material-symbols-outlined">dark</span>
        ) : (
          <span className="material-symbols-outlined">light</span>
        )}
      </button>
    </div>
  );
}
