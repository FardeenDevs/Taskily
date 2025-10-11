
"use client";

import { useState, memo, useCallback } from "react";
import { type Task, type Priority, type Effort } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Pencil, Trash2, Timer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PriorityBadge } from "./priority-badge";
import { EffortBadge } from "./effort-badge";
import { TaskTimer } from "./task-timer";
import { RunningTimer } from "./running-timer";
import type { ActiveTimer } from "@/lib/hooks/use-tasks";

interface TaskItemProps {
  task: Task;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (id: string, newText: string, newPriority: Priority | null, newEffort: Effort | null, newDuration: number | null) => void;
  showPriority: boolean;
  showEffort: boolean;
  activeTimer: ActiveTimer | undefined;
  onTimerStart: (taskId: string, duration: number) => void;
  onTimerPause: (taskId: string) => void;
  onTimerStop: (taskId: string) => void;
  onTimerTick: (taskId: string, remaining: number) => void;
}

export const TaskItem = memo(function TaskItem({ 
    task, 
    onToggleTask, 
    onDeleteTask, 
    onEditTask, 
    showPriority, 
    showEffort,
    activeTimer,
    onTimerStart,
    onTimerPause,
    onTimerStop,
    onTimerTick,
}: TaskItemProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [editPriority, setEditPriority] = useState<Priority | null>(task.priority ?? null);
  const [editEffort, setEditEffort] = useState<Effort | null>(task.effort ?? null);
  const [editDuration, setEditDuration] = useState<string>(task.duration ? String(task.duration) : "");
  const [isTimerDialogOpen, setIsTimerDialogOpen] = useState(false);


  const handleSave = useCallback(() => {
    const newDuration = editDuration ? parseInt(editDuration, 10) : null;
    onEditTask(
        task.id, 
        editText,
        showPriority ? editPriority : null,
        showEffort ? editEffort : null,
        (newDuration && !isNaN(newDuration)) ? newDuration : null
    );
    setIsEditDialogOpen(false);
  }, [task.id, editText, editPriority, editEffort, editDuration, onEditTask, showPriority, showEffort]);
  
  const openEditDialog = useCallback(() => {
    setEditText(task.text);
    setEditPriority(task.priority ?? null);
    setEditEffort(task.effort ?? null);
    setEditDuration(task.duration ? String(task.duration) : "");
    setIsEditDialogOpen(true);
  }, [task.text, task.priority, task.effort, task.duration]);

  const handleDelete = useCallback(() => {
    onDeleteTask(task.id);
  }, [task.id, onDeleteTask]);

  const handleToggle = useCallback(() => {
    onToggleTask(task.id);
  }, [task.id, onToggleTask]);


  return (
    <div className="group relative">
        <div className="flex items-center gap-3 p-2 transition-colors">
            <AnimatePresence>
                {task.completed && (
                <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 0.2 }}
                    exit={{ scaleX: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="absolute inset-0 bg-primary origin-left"
                />
                )}
            </AnimatePresence>
            <Checkbox
                id={`task-${task.id}`}
                checked={task.completed}
                onCheckedChange={handleToggle}
                aria-label={`Mark task "${task.text}" as ${task.completed ? 'incomplete' : 'complete'}`}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary relative z-10"
            />
            <div className="flex-1 flex items-center gap-2">
                <label
                htmlFor={`task-${task.id}`}
                className={cn(
                    "cursor-pointer text-sm font-medium transition-colors relative z-10",
                    task.completed && "text-muted-foreground line-through"
                )}
                >
                {task.text}
                </label>
            </div>
            <div className={cn("flex items-center gap-2 relative z-10 ml-auto", task.completed && 'opacity-40')}>
                {showPriority && task.priority && <PriorityBadge priority={task.priority} />}
                {showEffort && task.effort && <EffortBadge effort={task.effort} />}

                <div className="flex items-center gap-1">
                    <Dialog open={isTimerDialogOpen} onOpenChange={setIsTimerDialogOpen}>
                         <DialogTrigger asChild>
                            <div>
                                {activeTimer ? (
                                    <RunningTimer remainingTime={activeTimer.remaining} />
                                ) : task.duration ? (
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-primary">
                                        <Timer />
                                        <span className="sr-only">Start Timer</span>
                                    </Button>
                                ) : null}
                            </div>
                        </DialogTrigger>
                        <TaskTimer 
                            task={task}
                            activeTimer={activeTimer}
                            onTimerStart={onTimerStart}
                            onTimerPause={onTimerPause}
                            onTimerStop={onTimerStop}
                            onTimerTick={onTimerTick}
                            setIsOpen={setIsTimerDialogOpen}
                        />
                    </Dialog>

                    <div className="flex items-center opacity-0 transition-opacity group-hover:opacity-100">
                        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="editIcon" size="icon" className="h-8 w-8" aria-label={`Edit task "${task.text}"`} onClick={openEditDialog}>
                            <Pencil />
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
                            {showPriority && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Priority</Label>
                                    <Select onValueChange={(value) => setEditPriority(value as Priority)} value={editPriority ?? undefined}>
                                        <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Set priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                        <SelectItem value="P1">Priority 1 (Low)</SelectItem>
                                        <SelectItem value="P2">Priority 2</SelectItem>
                                        <SelectItem value="P3">Priority 3 (Medium)</SelectItem>
                                        <SelectItem value="P4">Priority 4</SelectItem>
                                        <SelectItem value="P5">Priority 5 (High)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            {showEffort && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Effort</Label>
                                    <Select onValueChange={(value) => setEditEffort(value as Effort)} value={editEffort ?? undefined}>
                                        <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Set effort" />
                                        </SelectTrigger>
                                        <SelectContent>
                                        <SelectItem value="E1">Effort 1 (Very Easy)</SelectItem>
                                        <SelectItem value="E2">Effort 2 (Easy)</SelectItem>
                                        <SelectItem value="E3">Effort 3 (Medium)</SelectItem>
                                        <SelectItem value="E4">Effort 4 (Hard)</SelectItem>
                                        <SelectItem value="E5">Effort 5 (Very Hard)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="task-duration" className="text-right">
                                    Duration
                                </Label>
                                <Input
                                    id="task-duration"
                                    type="number"
                                    value={editDuration}
                                    onChange={(e) => {
                                        if (e.target.value === '' || parseInt(e.target.value, 10) >= 0) {
                                        setEditDuration(e.target.value);
                                        }
                                    }}
                                    className="col-span-3"
                                    placeholder="Minutes (optional)"
                                />
                            </div>
                            </div>
                            <DialogFooter>
                            <Button type="submit" onClick={handleSave} variant="edit">Save changes</Button>
                            </DialogFooter>
                        </DialogContent>
                        </Dialog>
                        <Button
                        variant="destructiveIcon"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleDelete}
                        aria-label={`Delete task "${task.text}"`}
                        >
                        <Trash2 />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
});
