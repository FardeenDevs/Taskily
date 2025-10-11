
"use client";

import { useState, useEffect, useCallback } from 'react';
import { type Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Play, Pause, Square, Timer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TaskTimerProps {
  task: Task;
}

export function TaskTimer({ task }: TaskTimerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState((task.duration || 0) * 60);
  const { toast } = useToast();

  useEffect(() => {
    // Reset timer state if the dialog is closed or the task changes
    setTimeRemaining((task.duration || 0) * 60);
    setIsActive(false);
  }, [isOpen, task.duration]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prevTime => prevTime - 1);
      }, 1000);
    } else if (isActive && timeRemaining === 0) {
      setIsActive(false);
      toast({
        title: "Time's up!",
        description: `Your timer for "${task.text}" has finished.`,
      });
      // Optionally play a sound
      const audio = new Audio('/notification.mp3'); // Make sure you have this file in /public
      audio.play().catch(e => console.error("Error playing sound:", e));
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, timeRemaining, task.text, toast]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };
  
  const handleStop = () => {
    setIsActive(false);
    setTimeRemaining((task.duration || 0) * 60);
  };
  
  const handleToggle = () => {
    setIsActive(prev => !prev);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
          <Timer />
          <span className="sr-only">Start Timer</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Task Timer: {task.text}</DialogTitle>
          <DialogDescription>
            Focus on your task. You will be notified when the time is up.
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
    </Dialog>
  );
}
