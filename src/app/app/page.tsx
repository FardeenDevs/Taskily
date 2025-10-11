
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
import { ListFilter } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type SortOption = 'createdAt_asc' | 'priority_desc' | 'effort_desc' | 'priority_effort_desc' | 'text_asc' | 'text_desc';

const sortOptions: { value: SortOption, label: string, requires?: 'priority' | 'effort' }[] = [
    { value: 'createdAt_asc', label: 'Default' },
    { value: 'priority_desc', label: 'Priority', requires: 'priority' },
    { value: 'effort_desc', label: 'Effort', requires: 'effort' },
    { value: 'priority_effort_desc', label: 'Priority & Effort', requires: 'priority' },
    { value: 'text_asc', label: 'A-Z' },
    { value: 'text_desc', label: 'Z-A' },
];

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

  const [sortOrder, setSortOrder] = useState<SortOption>('createdAt_asc');

  const handleClearWorkspace = useCallback(() => {
    if (activeWorkspaceId) {
      clearWorkspace(activeWorkspaceId);
    }
  }, [activeWorkspaceId, clearWorkspace]);

  const handleAddTask = useCallback((text: string, priority: Priority | null, effort: Effort | null) => {
    addTask(text, priority, effort);
  }, [addTask]);

  const showPlaceholder = !activeWorkspaceId || !activeWorkspace;

  const showPriority = activeWorkspace?.showPriority ?? false;
  const showEffort = activeWorkspace?.showEffort ?? false;
  
  const activeSortLabel = useMemo(() => {
    return sortOptions.find(opt => opt.value === sortOrder)?.label || 'Default';
  }, [sortOrder]);


  const sortedTasks = useMemo(() => {
    if (!tasks) return [];
    
    return [...tasks].sort((a, b) => {
        // Completed tasks always go to the bottom
        if (a.completed && !b.completed) return 1;
        if (!a.completed && b.completed) return -1;

        switch (sortOrder) {
            case 'priority_desc':
                const priorityA = a.priority ? priorityMap[a.priority].value : 0;
                const priorityB = b.priority ? priorityMap[b.priority].value : 0;
                return priorityB - priorityA;
            case 'effort_desc':
                const effortA = a.effort ? effortMap[a.effort].value : 0;
                const effortB = b.effort ? effortMap[b.effort].value : 0;
                return effortB - effortA;
            case 'priority_effort_desc':
                 const prioA = a.priority ? priorityMap[a.priority].value : 0;
                 const prioB = b.priority ? priorityMap[b.priority].value : 0;
                 if (prioB !== prioA) return prioB - prioA;
                 const effA = a.effort ? effortMap[a.effort].value : 0;
                 const effB = b.effort ? effortMap[b.effort].value : 0;
                 return effB - effA;
            case 'text_asc':
                return a.text.localeCompare(b.text);
            case 'text_desc':
                return b.text.localeCompare(a.text);
            case 'createdAt_asc':
            default:
                 const dateA = a.createdAt ? (typeof (a.createdAt as any).toDate === 'function' ? (a.createdAt as any).toDate() : new Date(a.createdAt as string)) : new Date(0);
                 const dateB = b.createdAt ? (typeof (b.createdAt as any).toDate === 'function' ? (b.createdAt as any).toDate() : new Date(b.createdAt as string)) : new Date(0);
                 return dateA.getTime() - dateB.getTime();
        }
    });

  }, [tasks, sortOrder]);

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
                <div className="flex items-center justify-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <ListFilter className="mr-2 h-4 w-4" />
                                Sort by: {activeSortLabel}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {sortOptions.map(option => {
                                const isDisabled = (option.requires === 'priority' && !showPriority) || (option.requires === 'effort' && !showEffort);
                                if (isDisabled) return null;
                                return (
                                    <DropdownMenuItem key={option.value} onSelect={() => setSortOrder(option.value)}>
                                        {option.label}
                                    </DropdownMenuItem>
                                )
                            })}
                        </DropdownMenuContent>
                    </DropdownMenu>
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
                  showPriority={showPriority}
                  showEffort={showEffort}
                />
                <TaskList
                  tasks={sortedTasks}
                  onToggleTask={toggleTask}
                  onDeleteTask={deleteTask}
                  onEditTask={editTask}
                  showPriority={showPriority}
                  showEffort={showEffort}
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

    