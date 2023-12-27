"use client";

import { useTheme } from "../ThemeProvider";
import { Button } from "../ui/button";
import { MenuIcon } from "lucide-react";

export default function ToggleSidebarButton({
  className,
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setIsSidebarOpen } = useTheme();

  return (
    <Button
      variant={"ghost"}
      size={"icon"}
      className={className}
      onClick={() => setIsSidebarOpen(false)}
    >
      <MenuIcon />
    </Button>
  );
}
