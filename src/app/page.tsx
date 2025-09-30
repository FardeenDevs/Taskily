"use client";

import { useTasks } from "@/lib/hooks/use-tasks";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskProgress } from "@/app/components/task-progress";
import { TaskInput } from "@/app/components/task-input";
import { TaskList } from "@/app/components/task-list";
import { TaskSuggestions } from "@/app/components/task-suggestions";

export default function Home() {
  const {
    tasks,
    addTask,
    toggleTask,
    deleteTask,
    editTask,
    completedTasks,
    totalTasks,
  } = useTasks();

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-2xl">
        <Card className="border-2 border-border/50 shadow-2xl shadow-primary/5">
          <CardHeader>
            <CardTitle className="font-headline text-4xl font-bold tracking-tight text-foreground">
              Taskily
            </CardTitle>
            <CardDescription>
              Get things done, one task at a time.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <TaskProgress completed={completedTasks} total={totalTasks} />
            <TaskInput onAddTask={addTask} />
            <TaskList
              tasks={tasks}
              onToggleTask={toggleTask}
              onDeleteTask={deleteTask}
              onEditTask={editTask}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <TaskSuggestions currentTasks={tasks} onAddTask={addTask} />
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
