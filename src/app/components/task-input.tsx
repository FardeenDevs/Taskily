
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Plus } from "lucide-react";
import { useState, useEffect, memo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Priority, Effort, AppSettings } from "@/lib/types";

const formSchema = z.object({
  task: z.string().min(1, {
    message: "Task cannot be empty.",
  }).max(100, {
    message: "Task is too long.",
  }),
  priority: z.string().optional(),
  effort: z.string().optional(),
});

interface TaskInputProps {
  onAddTask: (text: string, priority: Priority | null, effort: Effort | null) => void;
  appSettings: AppSettings;
}

export const TaskInput = memo(function TaskInput({ onAddTask, appSettings }: TaskInputProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      task: "",
      priority: appSettings.defaultPriority,
      effort: appSettings.defaultEffort,
    },
  });

  const [isInputEmpty, setIsInputEmpty] = useState(true);

  useEffect(() => {
    form.reset({
      task: form.getValues('task'),
      priority: appSettings.defaultPriority,
      effort: appSettings.defaultEffort
    });
  }, [appSettings.defaultPriority, appSettings.defaultEffort, form]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      setIsInputEmpty(!value.task);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddTask(
      values.task,
      appSettings.showPriority ? (values.priority as Priority || null) : null,
      appSettings.showEffort ? (values.effort as Effort || null) : null
    );
    form.reset({ task: "", priority: appSettings.defaultPriority, effort: appSettings.defaultEffort });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col items-start gap-2">
        <div className="flex w-full items-start space-x-2">
          <FormField
            control={form.control}
            name="task"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    placeholder="Add a new task..."
                    {...field}
                    className="focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-shadow duration-300 focus-visible:shadow-[0_0_0_2px_hsl(var(--primary)_/_0.4)]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            size="icon"
            aria-label="Add task"
            disabled={isInputEmpty}
            variant="gradient"
            className="disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus />
          </Button>
        </div>
        {(appSettings.showPriority || appSettings.showEffort) && (
            <div className="grid grid-cols-2 gap-2 w-full">
            {appSettings.showPriority && (
                <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                    <FormItem>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="P1">Priority 1 (Low)</SelectItem>
                        <SelectItem value="P2">Priority 2</SelectItem>
                        <SelectItem value="P3">Priority 3 (Medium)</SelectItem>
                        <SelectItem value="P4">Priority 4</SelectItem>
                        <SelectItem value="P5">Priority 5 (High)</SelectItem>
                        </SelectContent>
                    </Select>
                    </FormItem>
                )}
                />
            )}
            {appSettings.showEffort && (
                <FormField
                control={form.control}
                name="effort"
                render={({ field }) => (
                    <FormItem>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Effort" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="E1">Effort 1 (Very Easy)</SelectItem>
                        <SelectItem value="E2">Effort 2 (Easy)</SelectItem>
                        <SelectItem value="E3">Effort 3 (Medium)</SelectItem>
                        <SelectItem value="E4">Effort 4 (Hard)</SelectItem>
                        <SelectItem value="E5">Effort 5 (Very Hard)</SelectItem>
                        </SelectContent>
                    </Select>
                    </FormItem>
                )}
                />
            )}
            </div>
        )}
      </form>
    </Form>
  );
});
