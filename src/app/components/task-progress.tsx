"use client";

import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

interface TaskProgressProps {
  completed: number;
  total: number;
}

export function TaskProgress({ completed, total }: TaskProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const newProgress = total > 0 ? (completed / total) * 100 : 0;
    setProgress(newProgress);
  }, [completed, total]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm font-medium text-green-600">
        <p>Progress</p>
        <p>
          {total > 0 && `${Math.round(progress)}% | `}
          {completed} / {total}
        </p>
      </div>
      <Progress value={progress} className="h-3 [&>div]:bg-green-500" />
    </div>
  );
}
