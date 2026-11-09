import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getAppTheme,
  setAppTheme,
  getMouseEffectsEnabled,
  setMouseEffectsEnabled as saveMouseEffectsEnabled,
  type AppTheme,
} from '../utils/studyStats';
export type { AppTheme };
import ThemeSelectorModal from '../components/ThemeSelectorModal';

interface ThemeContextValue {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  mouseEffectsEnabled: boolean;
  setMouseEffectsEnabled: (enabled: boolean) => void;
  toggleMouseEffects: () => void;
  isThemeModalOpen: boolean;
  openThemeModal: () => void;
  closeThemeModal: () => void;
  toggleThemeModal: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>(() => getAppTheme());
  const [mouseEffectsEnabled, setMouseEffectsState] = useState<boolean>(() =>
    getMouseEffectsEnabled()
  );
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Synchronize document attribute with active theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  // Synchronize document attribute with mouse effects setting
  useEffect(() => {
    const attrVal = mouseEffectsEnabled ? 'on' : 'off';
    document.documentElement.setAttribute('data-mouse-effects', attrVal);
    document.body.setAttribute('data-mouse-effects', attrVal);
  }, [mouseEffectsEnabled]);

  // Listen for theme & mouse effects changes across windows/components
  useEffect(() => {
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<AppTheme>;
      if (customEvent.detail && customEvent.detail !== theme) {
        setThemeState(customEvent.detail);
      }
    };

    const handleMouseEffectsChange = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      if (typeof customEvent.detail === 'boolean') {
        setMouseEffectsState(customEvent.detail);
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'keyt_selected_ui_theme') {
        const nextTheme = getAppTheme();
        setThemeState(nextTheme);
      } else if (e.key === 'keyt_mouse_effects_enabled') {
        setMouseEffectsState(getMouseEffectsEnabled());
      }
    };

    window.addEventListener('keyt-theme-changed', handleThemeChange);
    window.addEventListener('keyt-mouse-effects-changed', handleMouseEffectsChange);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('keyt-theme-changed', handleThemeChange);
      window.removeEventListener('keyt-mouse-effects-changed', handleMouseEffectsChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, [theme]);

  const changeTheme = useCallback((newTheme: AppTheme) => {
    setThemeState(newTheme);
    setAppTheme(newTheme);
  }, []);

  const changeMouseEffects = useCallback((enabled: boolean) => {
    setMouseEffectsState(enabled);
    saveMouseEffectsEnabled(enabled);
  }, []);

  const toggleMouseEffects = useCallback(() => {
    setMouseEffectsState((prev) => {
      const next = !prev;
      saveMouseEffectsEnabled(next);
      return next;
    });
  }, []);

  const openThemeModal = useCallback(() => setIsThemeModalOpen(true), []);
  const closeThemeModal = useCallback(() => setIsThemeModalOpen(false), []);
  const toggleThemeModal = useCallback(() => setIsThemeModalOpen((prev) => !prev), []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: changeTheme,
        mouseEffectsEnabled,
        setMouseEffectsEnabled: changeMouseEffects,
        toggleMouseEffects,
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
        mouseEffectsEnabled={mouseEffectsEnabled}
        onToggleMouseEffects={changeMouseEffects}
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
