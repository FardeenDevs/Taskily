
"use client";

import { useTasks } from "@/app/main-layout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { TaskProgress } from "@/app/components/task-progress";
import { TaskInput } from "@/app/components/task-input";
import { TaskList } from "@/app/components/task-list";
import { TaskSuggestions } from "@/app/components/task-suggestions";
import { Trash2 } from "lucide-react";
import { useCallback, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Priority, Effort, effortMap, priorityMap } from "@/lib/types";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ListFilter } from "lucide-react";

type SortOption = 'default' | 'priority' | 'effort';

export default function AppPage() {
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
    clearWorkspace,
    appSettings,
  } = useTasks();

  const [sortOrder, setSortOrder] = useState<SortOption>('default');

  const handleClearWorkspace = useCallback(() => {
    if (activeWorkspaceId) {
      clearWorkspace(activeWorkspaceId);
    }
  }, [activeWorkspaceId, clearWorkspace]);

  const handleAddTask = useCallback((text: string, priority: Priority | null, effort: Effort | null) => {
    addTask(text, priority, effort);
  }, [addTask]);

  const showPlaceholder = !activeWorkspaceId || !activeWorkspace;

  const sortedTasks = useMemo(() => {
    if (!tasks) return [];
    
    const sorted = [...tasks].sort((a, b) => {
        // Completed tasks always go to the bottom
        if (a.completed && !b.completed) return 1;
        if (!a.completed && b.completed) return -1;

        switch (sortOrder) {
            case 'priority':
                if (appSettings.showPriority) {
                    const priorityA = a.priority ? priorityMap[a.priority].value : 0;
                    const priorityB = b.priority ? priorityMap[b.priority].value : 0;
                    return priorityB - priorityA; // Higher value (P5) comes first
                }
                // Fallthrough to default if priority is hidden
            case 'effort':
                if (appSettings.showEffort) {
                    const effortA = a.effort ? effortMap[a.effort].value : 0;
                    const effortB = b.effort ? effortMap[b.effort].value : 0;
                    return effortB - effortA; // Higher value (E5) comes first
                }
                // Fallthrough to default if effort is hidden
            default:
                 const dateA = a.createdAt ? (typeof (a.createdAt as any).toDate === 'function' ? (a.createdAt as any).toDate() : new Date(a.createdAt as string)) : new Date(0);
                 const dateB = b.createdAt ? (typeof (b.createdAt as any).toDate === 'function' ? (b.createdAt as any).toDate() : new Date(b.createdAt as string)) : new Date(0);
                 return dateA.getTime() - dateB.getTime();
        }
    });

    return sorted;

  }, [tasks, sortOrder, appSettings.showPriority, appSettings.showEffort]);

  return (
      <div className="mx-auto max-w-5xl w-full h-full p-4 sm:p-8">
        <Card className="border-2 border-border/50 shadow-2xl shadow-primary/5 overflow-hidden h-full flex flex-col">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <CardTitle className="font-headline text-2xl font-bold tracking-tight text-foreground text-center">
                {activeWorkspace?.name || "Listily Utilities"}
              </CardTitle>
            </div>
             {!showPlaceholder && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <ListFilter className="h-4 w-4" />
                    <span>Sort by</span>
                  </div>
                  <ToggleGroup
                    type="single"
                    value={sortOrder}
                    onValueChange={(value: SortOption) => value && setSortOrder(value)}
                    className="justify-center"
                  >
                    <ToggleGroupItem value="default" aria-label="Sort by date">
                      Default
                    </ToggleGroupItem>
                    {appSettings.showPriority && (
                        <ToggleGroupItem value="priority" aria-label="Sort by priority">
                        Priority
                        </ToggleGroupItem>
                    )}
                    {appSettings.showEffort && (
                        <ToggleGroupItem value="effort" aria-label="Sort by effort">
                        Effort
                        </ToggleGroupItem>
                    )}
                  </ToggleGroup>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-8 flex-grow overflow-y-auto p-6 pt-0">
            {showPlaceholder ? (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 p-12 text-center h-64">
                  <h3 className="text-lg font-semibold text-muted-foreground">Select a Listspace</h3>
                  <p className="text-sm text-muted-foreground">Choose a listspace from the sidebar to get started.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <TaskProgress completed={completedTasks} total={totalTasks} />
                <TaskInput 
                  onAddTask={handleAddTask} 
                  appSettings={appSettings}
                />
                <TaskList
                  tasks={sortedTasks}
                  onToggleTask={toggleTask}
                  onDeleteTask={deleteTask}
                  onEditTask={editTask}
                  appSettings={appSettings}
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
                  <AlertDialogAction onClick={handleClearWorkspace} variant="destructive">
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
