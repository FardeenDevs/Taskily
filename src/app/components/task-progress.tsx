"use client";

import { Progress } from "@/components/ui/progress";
import { useEffect, useState, memo } from "react";
import { cn } from "@/lib/utils";

interface TaskProgressProps {
  completed: number;
  total: number;
}

export const TaskProgress = memo(function TaskProgress({ completed, total }: TaskProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const newProgress = total > 0 ? (completed / total) * 100 : 0;
    setProgress(newProgress);
  }, [completed, total]);

  return (
    <div className="space-y-2">
      <div className={cn(
        "flex justify-between items-center text-sm font-medium",
        total > 0 ? "text-primary" : "text-muted-foreground"
      )}>
        <p>Progress</p>
        <p>
          {total > 0 && `${Math.round(progress)}% | `}
          {completed} / {total}
        </p>
      </div>
      <Progress value={progress} className="h-3 [&>div]:bg-gradient-to-r from-primary-gradient-start to-primary-gradient-end" />
    </div>
  );
});
