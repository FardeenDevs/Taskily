
"use client";

import { useEffect, useRef, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface TimerAlertDialogProps {
  task: Task;
  onClose: () => void;
}

// Helper to create a repeating beep sound
const useRepeatingBeep = (shouldPlay: boolean) => {
    const audioContextRef = useRef<AudioContext | null>(null);
    const oscillatorRef = useRef<OscillatorNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (shouldPlay) {
            // Initialize audio context on user interaction
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            const audioContext = audioContextRef.current;

            const playBeep = () => {
                if (!audioContext) return;
                // Stop any previous sound
                if (oscillatorRef.current) {
                    oscillatorRef.current.stop();
                }

                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5 note
                gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);

                oscillator.start();
                gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.5);
                oscillator.stop(audioContext.currentTime + 0.5);

                oscillatorRef.current = oscillator;
                gainNodeRef.current = gainNode;
            };

            playBeep(); // Play immediately
            intervalRef.current = setInterval(playBeep, 1500); // Repeat every 1.5 seconds

        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
            if (oscillatorRef.current) {
                oscillatorRef.current.stop();
            }
        }

        // Cleanup on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (oscillatorRef.current) {
                try { oscillatorRef.current.stop(); } catch (e) {}
            }
        };
    }, [shouldPlay]);
};


export function TimerAlertDialog({ task, onClose }: TimerAlertDialogProps) {
  const [isOpen, setIsOpen] = useState(true);
  useRepeatingBeep(isOpen);

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Time's Up!</AlertDialogTitle>
          <AlertDialogDescription>
            Your timer for the task "{task.text}" has finished.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction asChild>
            <Button onClick={handleClose}>
              Got it
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
