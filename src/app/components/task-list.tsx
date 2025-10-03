
"use client";

import { type Task, type Priority, type Effort } from "@/lib/types";
import { TaskItem } from "@/app/components/task-item";
import { AnimatePresence, motion } from "framer-motion";
import { memo } from "react";

interface TaskListProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (id: string, newText: string, newPriority: Priority | null, newEffort: Effort | null) => void;
}

export const TaskList = memo(function TaskList({ tasks, onToggleTask, onDeleteTask, onEditTask }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 p-12 text-center">
        <h3 className="text-lg font-semibold text-muted-foreground">No tasks yet!</h3>
        <p className="text-sm text-muted-foreground">Add a task above to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            layout
            initial={{ opacity: 0, x: -20, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, x: 50, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <TaskItem
              task={task}
              onToggleTask={onToggleTask}
              onDeleteTask={onDeleteTask}
              onEditTask={onEditTask}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
});
