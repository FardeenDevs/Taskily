"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Plus } from "lucide-react";

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

export function TaskInput({ onAddTask }: TaskInputProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      task: "",
    },
  });

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
                <Input placeholder="Add a new task..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="icon" aria-label="Add task" className="bg-green-500 hover:bg-green-600 text-white">
          <Plus />
        </Button>
      </form>
    </Form>
  );
}
