/**
 * ConfigContext — exposes the V4.0 ConfigModel globally.
 *
 * Mirrors the role of Get.find<SplashController>().configModel in the Flutter source.
 * The provider fetches the config on mount and provides:
 *  - config: ConfigModel | null
 *  - loading: boolean
 *  - refresh(): Promise<void> — re-fetch the config
 *  - isMaintenance: boolean
 *  - isForcedUpdate: boolean
 */

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppConstants } from '@/constants/app_constants';
import { fetchConfig, isInMaintenanceMode, isForcedUpdateRequired } from '@/services/v40_additions';
import type { ConfigModel } from '@/types';

export interface ConfigContextValue {
  config: ConfigModel | null;
  loading: boolean;
  isMaintenance: boolean;
  isForcedUpdate: boolean;
  refresh: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextValue | undefined>(undefined);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ConfigModel | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const c = await fetchConfig();
      setConfig(c);
    } catch (e) {
      console.warn('Config fetch failed:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const value = useMemo<ConfigContextValue>(
    () => ({
      config,
      loading,
      isMaintenance: isInMaintenanceMode(config),
      isForcedUpdate: isForcedUpdateRequired(config, AppConstants.appVersion),
      refresh,
    }),
    [config, loading]
  );

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) {
    throw new Error('useConfig must be used inside ConfigProvider');
  }
  return ctx;
}

/**
 * Convenience hook that returns a Module by type. Mirrors
 * SplashController.getModuleConfig(moduleType) in the Flutter source.
 */
export function useModuleConfig(moduleType: string | null) {
  const { config } = useConfig();
  if (!config || !moduleType) return null;
  return config.module_config?.[moduleType] ?? null;
}
