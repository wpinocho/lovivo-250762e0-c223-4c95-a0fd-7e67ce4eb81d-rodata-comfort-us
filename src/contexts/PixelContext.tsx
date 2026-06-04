import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { facebookPixel } from '@/lib/facebook-pixel';
import { tracking } from '@/lib/tracking-utils';

interface PixelContextType {
  pixelId: string | null;
  fbp: string | null;
  fbc: string | null;
  loading: boolean;
}

const PixelContext = createContext<PixelContextType | undefined>(undefined);

// Helper to get cookie value
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
};

export function PixelProvider({ children }: { children: React.ReactNode }) {
  const { metaPixelId, isLoading } = useSettings();
  const [fbp, setFbp] = useState<string | null>(null);
  const [fbc, setFbc] = useState<string | null>(null);

  // Capture Meta cookies on mount and when URL changes (fbc comes from click)
  useEffect(() => {
    const LS_FBC_KEY = '_fbc_fallback';
    const LS_FBP_KEY = '_fbp_fallback';

    const captureCookies = () => {
      const fbpVal = getCookie('_fbp') || localStorage.getItem(LS_FBP_KEY) || null;
      const fbcVal = getCookie('_fbc') || localStorage.getItem(LS_FBC_KEY) || null;
      setFbp(fbpVal);
      setFbc(fbcVal);

      // Mirror cookies to localStorage so they survive navigation & refresh
      if (fbpVal) localStorage.setItem(LS_FBP_KEY, fbpVal);
      if (fbcVal) localStorage.setItem(LS_FBC_KEY, fbcVal);
    };

    captureCookies();

    // Check for fbclid in URL params (present on first ad-click landing)
    const urlParams = new URLSearchParams(window.location.search);
    const fbclid = urlParams.get('fbclid');
    if (fbclid) {
      // fbc format: fb.1.<subdomain_creation_time>.<fbclid>
      const fbcValue = `fb.1.${Date.now()}.${fbclid}`;

      // Persist to localStorage FIRST so it survives all future navigations
      localStorage.setItem(LS_FBC_KEY, fbcValue);

      // Also set as a first-party cookie (90 days) as backup
      try {
        const expires = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = `_fbc=${fbcValue}; path=/; expires=${expires}; SameSite=Lax`;
      } catch {}

      setFbc(fbcValue);
    }
  }, []);

  // Initialize pixel and update tracking utility when pixel data is available
  useEffect(() => {
    if (metaPixelId && !isLoading) {
      facebookPixel.init(metaPixelId);
      facebookPixel.pageView();
    }

    // Update tracking utility with pixel data
    tracking.setPixelData(metaPixelId, fbp, fbc);
  }, [metaPixelId, isLoading, fbp, fbc]);

  return (
    <PixelContext.Provider value={{ pixelId: metaPixelId, fbp, fbc, loading: isLoading }}>
      {children}
    </PixelContext.Provider>
  );
}

export function usePixel() {
  const context = useContext(PixelContext);
  if (context === undefined) {
    throw new Error('usePixel must be used within a PixelProvider');
  }
  return context;
}