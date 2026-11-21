import React, { createContext, useContext, useState, useEffect, useLayoutEffect, useCallback } from 'react';
import {
  getAppTheme,
  setAppTheme,
  getMouseEffectsEnabled,
  setMouseEffectsEnabled as saveMouseEffectsEnabled,
  getHoverTranslateEnabled,
  setHoverTranslateEnabled as saveHoverTranslateEnabled,
  getShinScene,
  setShinScene as saveShinScene,
  getMoneyVaultFinish,
  setMoneyVaultFinish as saveMoneyVaultFinish,
  type AppTheme,
  type ShinSceneId,
  type MoneyVaultFinish,
} from '../utils/studyStats';
export type { AppTheme, ShinSceneId, MoneyVaultFinish };
import ThemeSelectorModal from '../components/ThemeSelectorModal';

interface ThemeContextValue {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  mouseEffectsEnabled: boolean;
  setMouseEffectsEnabled: (enabled: boolean) => void;
  toggleMouseEffects: () => void;
  hoverTranslateEnabled: boolean;
  setHoverTranslateEnabled: (enabled: boolean) => void;
  toggleHoverTranslate: () => void;
  shinScene: ShinSceneId;
  setShinScene: (scene: ShinSceneId) => void;
  moneyFinish: MoneyVaultFinish;
  setMoneyFinish: (finish: MoneyVaultFinish) => void;
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
  const [hoverTranslateEnabled, setHoverTranslateState] = useState<boolean>(() =>
    getHoverTranslateEnabled()
  );
  const [shinScene, setShinSceneState] = useState<ShinSceneId>(() => getShinScene());
  const [moneyFinish, setMoneyFinishState] = useState<MoneyVaultFinish>(() =>
    getMoneyVaultFinish()
  );
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Synchronize document attribute with active theme synchronously before paint
  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  // Synchronize document attribute with active Shin Kasukabe scene synchronously before paint
  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-shin-scene', shinScene);
    document.body.setAttribute('data-shin-scene', shinScene);
  }, [shinScene]);

  // Synchronize document attribute with active Billionaire Vault finish synchronously before paint
  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-money-finish', moneyFinish);
    document.body.setAttribute('data-money-finish', moneyFinish);
  }, [moneyFinish]);

  // Synchronize document attribute with mouse effects setting
  useEffect(() => {
    const attrVal = mouseEffectsEnabled ? 'on' : 'off';
    document.documentElement.setAttribute('data-mouse-effects', attrVal);
    document.body.setAttribute('data-mouse-effects', attrVal);
  }, [mouseEffectsEnabled]);

  // Synchronize document attribute with hover translate setting
  useEffect(() => {
    const attrVal = hoverTranslateEnabled ? 'on' : 'off';
    document.documentElement.setAttribute('data-hover-translate-mode', attrVal);
    document.body.setAttribute('data-hover-translate-mode', attrVal);
  }, [hoverTranslateEnabled]);

  // Listen for theme, mouse effects & hover translate changes across windows/components
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

    const handleHoverTranslateChange = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      if (typeof customEvent.detail === 'boolean') {
        setHoverTranslateState(customEvent.detail);
      }
    };

    const handleShinSceneChange = (e: Event) => {
      const customEvent = e as CustomEvent<ShinSceneId>;
      if (customEvent.detail) {
        setShinSceneState(customEvent.detail);
      }
    };

    const handleMoneyFinishChange = (e: Event) => {
      const customEvent = e as CustomEvent<MoneyVaultFinish>;
      if (customEvent.detail) {
        setMoneyFinishState(customEvent.detail);
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'keyt_selected_ui_theme') {
        const nextTheme = getAppTheme();
        setThemeState(nextTheme);
      } else if (e.key === 'keyt_mouse_effects_enabled') {
        setMouseEffectsState(getMouseEffectsEnabled());
      } else if (e.key === 'keyt_hover_translate_enabled') {
        setHoverTranslateState(getHoverTranslateEnabled());
      } else if (e.key === 'keyt_shin_scene_id') {
        setShinSceneState(getShinScene());
      } else if (e.key === 'keyt_money_vault_finish') {
        setMoneyFinishState(getMoneyVaultFinish());
      }
    };

    window.addEventListener('keyt-theme-changed', handleThemeChange);
    window.addEventListener('keyt-mouse-effects-changed', handleMouseEffectsChange);
    window.addEventListener('keyt-hover-translate-changed', handleHoverTranslateChange);
    window.addEventListener('keyt-shin-scene-changed', handleShinSceneChange);
    window.addEventListener('keyt-money-finish-changed', handleMoneyFinishChange);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('keyt-theme-changed', handleThemeChange);
      window.removeEventListener('keyt-mouse-effects-changed', handleMouseEffectsChange);
      window.removeEventListener('keyt-hover-translate-changed', handleHoverTranslateChange);
      window.removeEventListener('keyt-shin-scene-changed', handleShinSceneChange);
      window.removeEventListener('keyt-money-finish-changed', handleMoneyFinishChange);
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

  const changeHoverTranslate = useCallback((enabled: boolean) => {
    setHoverTranslateState(enabled);
    saveHoverTranslateEnabled(enabled);
  }, []);

  const toggleHoverTranslate = useCallback(() => {
    setHoverTranslateState((prev) => {
      const next = !prev;
      saveHoverTranslateEnabled(next);
      return next;
    });
  }, []);

  const changeShinScene = useCallback((nextScene: ShinSceneId) => {
    setShinSceneState(nextScene);
    saveShinScene(nextScene);
  }, []);

  const changeMoneyFinish = useCallback((nextFinish: MoneyVaultFinish) => {
    setMoneyFinishState(nextFinish);
    saveMoneyVaultFinish(nextFinish);
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
        hoverTranslateEnabled,
        setHoverTranslateEnabled: changeHoverTranslate,
        toggleHoverTranslate,
        shinScene,
        setShinScene: changeShinScene,
        moneyFinish,
        setMoneyFinish: changeMoneyFinish,
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
        hoverTranslateEnabled={hoverTranslateEnabled}
        onToggleHoverTranslate={changeHoverTranslate}
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
