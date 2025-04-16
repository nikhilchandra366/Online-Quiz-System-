
import React from 'react';
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="rounded-full hover:bg-muted"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5 text-indigo-500" />
            ) : (
              <Sun className="h-5 w-5 text-yellow-500" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Toggle {theme === "light" ? "dark" : "light"} mode</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
