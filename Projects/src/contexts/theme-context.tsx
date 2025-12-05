"use client";

import React, { createContext, useContext, useEffect, ReactNode } from "react";
import settingsService from "@/services/settings.service";

interface ThemeContextType {
  applyTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const hexToHSL = (hex: string): string => {
  // Convert hex to RGB
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `${h} ${s}% ${l}%`;
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const applyTheme = async () => {
    try {
      const list = await settingsService.list();
      const map: Record<string, string | null> = {};
      list.forEach((s) => (map[s.key] = s.value));

      // Apply theme colors to CSS variables
      const root = document.documentElement;
      if (map["themePrimary"]) {
        root.style.setProperty("--primary", hexToHSL(map["themePrimary"]));
      }
      if (map["themePrimaryForeground"]) {
        root.style.setProperty(
          "--primary-foreground",
          hexToHSL(map["themePrimaryForeground"])
        );
      }
      if (map["themeBackground"]) {
        root.style.setProperty(
          "--background",
          hexToHSL(map["themeBackground"])
        );
      }
      if (map["themeForeground"]) {
        root.style.setProperty(
          "--foreground",
          hexToHSL(map["themeForeground"])
        );
      }
      if (map["themeAccent"]) {
        root.style.setProperty("--accent", hexToHSL(map["themeAccent"]));
      }
      if (map["themeAccentForeground"]) {
        root.style.setProperty(
          "--accent-foreground",
          hexToHSL(map["themeAccentForeground"])
        );
      }
    } catch (error) {
      console.error("Failed to load theme settings:", error);
    }
  };

  // Load theme on mount (only in browser)
  useEffect(() => {
    // Delay theme loading to avoid blocking initial render
    const timer = setTimeout(() => {
      applyTheme();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeContext.Provider value={{ applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
