"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { AppThemeProvider } from "@/theme/AppThemeProvider";

export function Providers({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AppThemeProvider>{children}</AppThemeProvider>
    </ThemeProvider>
  );
}
