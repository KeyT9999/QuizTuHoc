import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getAppTheme,
  setAppTheme,
  type AppTheme,
} from '../utils/studyStats';
import ThemeSelectorModal from '../components/ThemeSelectorModal';

interface ThemeContextValue {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  isThemeModalOpen: boolean;
  openThemeModal: () => void;
  closeThemeModal: () => void;
  toggleThemeModal: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>(() => getAppTheme());
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Synchronize document attribute with active theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  // Listen for theme changes across windows/components
  useEffect(() => {
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<AppTheme>;
      if (customEvent.detail && customEvent.detail !== theme) {
        setThemeState(customEvent.detail);
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'keyt_selected_ui_theme') {
        const nextTheme = getAppTheme();
        setThemeState(nextTheme);
      }
    };

    window.addEventListener('keyt-theme-changed', handleThemeChange);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('keyt-theme-changed', handleThemeChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, [theme]);

  const changeTheme = useCallback((newTheme: AppTheme) => {
    setThemeState(newTheme);
    setAppTheme(newTheme);
  }, []);

  const openThemeModal = useCallback(() => setIsThemeModalOpen(true), []);
  const closeThemeModal = useCallback(() => setIsThemeModalOpen(false), []);
  const toggleThemeModal = useCallback(() => setIsThemeModalOpen((prev) => !prev), []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: changeTheme,
        isThemeModalOpen,
        openThemeModal,
        closeThemeModal,
        toggleThemeModal,
      }}
    >
      {children}
      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={closeThemeModal}
        currentTheme={theme}
        onSelectTheme={changeTheme}
      />
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
