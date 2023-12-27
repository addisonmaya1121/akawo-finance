"use client";

import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { useMemo } from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ToggleTheme() {
  const { setTheme, theme } = useTheme();
  const isChecked = useMemo(() => theme === "dark", [theme]);
  return (
    <div className="flex items-center space-x-2">
      {isChecked ? (
        <MoonIcon className="w-5 h-5" />
      ) : (
        <SunIcon className="w-5 h-5" />
      )}
      <Switch
        id="toggle-theme"
        className="data-[state=checked]:bg-secondary"
        bulletClassName="bg-white"
        checked={isChecked}
        onCheckedChange={(val) => (val ? setTheme("dark") : setTheme("light"))}
      />
      <Label htmlFor="airplane-mode">Dark Mode</Label>
    </div>
  );
}
