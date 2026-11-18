import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import type { Theme } from "../lib/theme";

export const THEME_ICONS: Readonly<Record<Theme, LucideIcon>> = {
  system: Monitor,
  light: Sun,
  dark: Moon,
};
