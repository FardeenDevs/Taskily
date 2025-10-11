
"use client";

import { type Task, type Priority, type Effort } from "@/lib/types";
import { TaskItem } from "@/app/components/task-item";
import { AnimatePresence, motion } from "framer-motion";
import { memo } from "react";
import type { ActiveTimer } from "@/lib/hooks/use-tasks";

interface TaskListProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (id: string, newText: string, newPriority: Priority | null, newEffort: Effort | null, newDuration: number | null) => void;
  showPriority: boolean;
  showEffort: boolean;
  activeTimers: ActiveTimer[];
  onTimerStart: (taskId: string, duration: number) => void;
  onTimerPause: (taskId: string) => void;
  onTimerStop: (taskId: string) => void;
  onTimerTick: (taskId: string, remaining: number) => void;
}

export const TaskList = memo(function TaskList({ 
  tasks, 
  onToggleTask, 
  onDeleteTask, 
  onEditTask, 
  showPriority, 
  showEffort,
  activeTimers,
  onTimerStart,
  onTimerPause,
  onTimerStop,
  onTimerTick
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 p-12 text-center">
        <h3 className="text-lg font-semibold text-muted-foreground">No tasks yet!</h3>
        <p className="text-sm text-muted-foreground">Add a task above to get started.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <AnimatePresence>
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            layout
            initial={{ opacity: 0, x: -20, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, x: 50, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(index < tasks.length - 1 && "border-b")}
          >
            <TaskItem
              task={task}
              onToggleTask={onToggleTask}
              onDeleteTask={onDeleteTask}
              onEditTask={onEditTask}
              showPriority={showPriority}
              showEffort={showEffort}
              activeTimer={activeTimers.find(t => t.taskId === task.id)}
              onTimerStart={onTimerStart}
              onTimerPause={onTimerPause}
              onTimerStop={onTimerStop}
              onTimerTick={onTimerTick}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
});
