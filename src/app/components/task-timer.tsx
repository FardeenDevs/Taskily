
"use client";

import { useState, useEffect } from 'react';
import { type Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Play, Pause, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ActiveTimer } from '@/lib/hooks/use-tasks';

interface TaskTimerProps {
  task: Task;
  activeTimer: ActiveTimer | undefined;
  onTimerStart: (taskId: string, duration: number) => void;
  onTimerPause: (taskId: string) => void;
  onTimerStop: (taskId: string) => void;
  onTimerTick: (taskId: string, remaining: number) => void;
  setIsOpen: (isOpen: boolean) => void;
}

export function TaskTimer({ task, activeTimer, onTimerStart, onTimerPause, onTimerStop, onTimerTick, setIsOpen }: TaskTimerProps) {
  const { toast } = useToast();

  const timeRemaining = activeTimer?.remaining ?? (task.duration || 0) * 60;
  const isActive = activeTimer?.isActive ?? false;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        const newRemaining = timeRemaining - 1;
        onTimerTick(task.id, newRemaining);
      }, 1000);
    } else if (isActive && timeRemaining === 0) {
      onTimerStop(task.id);
      toast({
        title: "Time's up!",
        description: `Your timer for "${task.text}" has finished.`,
      });
      setIsOpen(false);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, timeRemaining, task, toast, onTimerTick, onTimerStop, setIsOpen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };
  
  const handleStop = () => {
    onTimerStop(task.id);
    setIsOpen(false);
  };
  
  const handleToggle = () => {
    if (isActive) {
      onTimerPause(task.id);
    } else {
      onTimerStart(task.id, timeRemaining);
    }
  };

  return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Task Timer: {task.text}</DialogTitle>
          <DialogDescription>
            Focus on your task. You can close this window; the timer will continue in the background.
          </DialogDescription>
        </DialogHeader>
        <div className="my-8 flex items-center justify-center">
            <p className="text-7xl font-bold font-mono tabular-nums tracking-tighter">
                {formatTime(timeRemaining)}
            </p>
        </div>
        <DialogFooter className="flex-row justify-center sm:justify-center gap-2">
            <Button variant={isActive ? "outline" : "gradient"} onClick={handleToggle} className="w-24">
                {isActive ? <><Pause className="mr-2" />Pause</> : <><Play className="mr-2" />Start</>}
            </Button>
             <Button variant="destructive" onClick={handleStop} className="w-24">
                <Square className="mr-2" />Stop
            </Button>
        </DialogFooter>
      </DialogContent>
  );
}

    