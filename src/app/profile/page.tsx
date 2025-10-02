
"use client";

import { useEffect } from "react";
import { useUser } from "@/firebase";
import { useTasks } from "@/lib/hooks/use-tasks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MainLayout } from "../components/main-layout";
import { useState } from "react";
import { PageTransition } from "../components/page-transition";

const profileFormSchema = z.object({
  displayName: z.string().min(2, { message: "Name must be at least 2 characters." }).max(50, { message: "Name is too long." }),
});

export default function ProfilePage() {
  const { user } = useUser();
  const tasksHook = useTasks();
  const { updateUserProfile } = tasksHook;
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: user?.displayName || "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({ displayName: user.displayName || "" });
    }
  }, [user, form]);

  const onSubmit = (values: z.infer<typeof profileFormSchema>) => {
    updateUserProfile(values.displayName);
  };
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name[0];
  };

  if (!user) {
    return (
       <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <MainLayout tasksHook={tasksHook} setIsSettingsOpen={setIsSettingsOpen} setIsNavigating={setIsNavigating}>
       <div className="mx-auto max-w-2xl w-full h-full p-4 sm:p-8">
        <PageTransition>
          <Card className="border-2 border-border/50 shadow-2xl shadow-primary/5">
            <CardHeader>
              <CardTitle>My Profile</CardTitle>
              <CardDescription>View and edit your personal information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                  <AvatarFallback className="text-3xl">{getInitials(user.displayName)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                    <p className="text-2xl font-bold">{user.displayName}</p>
                    <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isDirty}>
                    {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </Form>

            </CardContent>
          </Card>
        </PageTransition>
      </div>
    </MainLayout>
  );
}
