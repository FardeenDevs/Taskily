
"use client";

import { useTasks } from "@/app/main-layout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { TaskProgress } from "@/app/components/task-progress";
import { TaskInput } from "@/app/components/task-input";
import { TaskList } from "@/app/components/task-list";
import { TaskSuggestions } from "@/app/components/task-suggestions";
import { Trash2 } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Priority, Effort } from "@/lib/types";

export default function Home() {
  const {
    tasks,
    addTask,
    toggleTask,
    deleteTask,
    editTask,
    completedTasks,
    totalTasks,
    activeWorkspace,
    activeWorkspaceId,
    clearTasks,
    appSettings,
  } = useTasks();

  const handleClearTasks = useCallback(() => {
    if (activeWorkspaceId) {
      clearTasks(activeWorkspaceId);
    }
  }, [activeWorkspaceId, clearTasks]);

  const handleAddTask = useCallback((text: string, priority: Priority | null, effort: Effort | null) => {
    addTask(text, priority, effort);
  }, [addTask]);

  return (
      <div className="mx-auto max-w-5xl w-full h-full p-4 sm:p-8">
        <Card className="border-2 border-border/50 shadow-2xl shadow-primary/5 overflow-hidden h-full flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-center gap-2">
              <CardTitle className="font-headline text-2xl font-bold tracking-tight text-foreground text-center">
                {activeWorkspace?.name || "My List"}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-8 flex-grow overflow-y-auto p-6 pt-0">
            {!activeWorkspace ? (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 p-12 text-center h-64">
                  <h3 className="text-lg font-semibold text-muted-foreground">Select a Listspace</h3>
                  <p className="text-sm text-muted-foreground">Choose a listspace from the sidebar to get started.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <TaskProgress completed={completedTasks} total={totalTasks} />
                <TaskInput 
                  onAddTask={handleAddTask} 
                  defaultPriority={appSettings.defaultPriority}
                  defaultEffort={appSettings.defaultEffort}
                />
                <TaskList
                  tasks={tasks}
                  onToggleTask={toggleTask}
                  onDeleteTask={deleteTask}
                  onEditTask={editTask}
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex items-center justify-between flex-shrink-0">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={tasks.length === 0 || !activeWorkspace}
                  className="disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All Tasks
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all tasks in this list. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearTasks} variant="destructive">
                    Yes, clear all
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <TaskSuggestions currentTasks={tasks} onAddTask={(text) => addTask(text, null, null)} />
          </CardFooter>
        </Card>
      </div>
  );
}

