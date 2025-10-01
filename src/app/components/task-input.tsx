"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Plus } from "lucide-react";
import { useState, useEffect, memo } from "react";

const formSchema = z.object({
  task: z.string().min(1, {
    message: "Task cannot be empty.",
  }).max(100, {
    message: "Task is too long.",
  }),
});

interface TaskInputProps {
  onAddTask: (text: string) => void;
}

export const TaskInput = memo(function TaskInput({ onAddTask }: TaskInputProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      task: "",
    },
  });

  const [isInputEmpty, setIsInputEmpty] = useState(true);

  useEffect(() => {
    const subscription = form.watch((value) => {
      setIsInputEmpty(!value.task);
    });
    return () => subscription.unsubscribe();
  }, [form]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddTask(values.task);
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full items-start space-x-2">
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
            className="disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
        >
          <Plus />
        </Button>
      </form>
    </Form>
  );
});

    