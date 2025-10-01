"use client";

import { useState } from "react";
import { type Task } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TaskItemProps {
  task: Task;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (id: string, newText: string) => void;
}

export function TaskItem({ task, onToggleTask, onDeleteTask, onEditTask }: TaskItemProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editText, setEditText] = useState(task.text);

  const handleSave = () => {
    onEditTask(task.id, editText);
    setIsEditDialogOpen(false);
  };

  return (
    <div className="group relative flex items-center gap-3 rounded-lg bg-secondary/50 p-3 transition-colors hover:bg-secondary overflow-hidden">
       <AnimatePresence>
        {task.completed && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute inset-0 bg-primary/20 origin-left"
          />
        )}
      </AnimatePresence>
      <Checkbox
        id={`task-${task.id}`}
        checked={task.completed}
        onCheckedChange={() => onToggleTask(task.id)}
        aria-label={`Mark task "${task.text}" as ${task.completed ? 'incomplete' : 'complete'}`}
        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary relative z-10"
      />
      <label
        htmlFor={`task-${task.id}`}
        className={cn(
          "flex-1 cursor-pointer text-sm font-medium transition-colors relative z-10",
          task.completed && "text-muted-foreground line-through"
        )}
      >
        {task.text}
      </label>
      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 relative z-10">
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600" aria-label={`Edit task "${task.text}"`}>
              <Pencil className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="task-text" className="text-right">
                  Task
                </Label>
                <Input
                  id="task-text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="col-span-3"
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-500 hover:text-red-600"
          onClick={() => onDeleteTask(task.id)}
          aria-label={`Delete task "${task.text}"`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
