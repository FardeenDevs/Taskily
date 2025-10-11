
"use client";

import { Timer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RunningTimerProps {
  remainingTime: number;
}

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export function RunningTimer({ remainingTime }: RunningTimerProps) {
  return (
    <Button variant="ghost" className="h-8 px-2 text-primary hover:text-primary hover:bg-transparent font-mono tabular-nums">
        <Timer className="mr-2 h-4 w-4" />
        {formatTime(remainingTime)}
    </Button>
  );
}
