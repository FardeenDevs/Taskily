
"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser, useFirestore } from "@/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { sendPasswordResetEmail, updateProfile } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { doc, updateDoc } from "firebase/firestore";

const profileFormSchema = z.object({
  displayName: z.string().min(2, { message: "Name must be at least 2 characters." }).max(50, { message: "Name is too long." }),
  photoURL: z.string().url({ message: "Please enter a valid URL." }).or(z.literal('')),
});

export default function ProfilePage() {
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isPasswordResetting, setIsPasswordResetting] = useState(false);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: user?.displayName || "",
      photoURL: user?.photoURL || "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
      });
    }
  }, [user, form]);

  const onSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    if (!user || !auth?.currentUser || !firestore) {
      toast({ variant: "destructive", title: "Not signed in" });
      return;
    }
    
    const currentUser = auth.currentUser;
    const userDocRef = doc(firestore, 'users', currentUser.uid);

    try {
      const authUpdatePromise = updateProfile(currentUser, { 
        displayName: values.displayName.trim(),
        photoURL: values.photoURL.trim(),
      });

      const firestoreUpdatePromise = updateDoc(userDocRef, {
        displayName: values.displayName.trim(),
        photoURL: values.photoURL.trim(),
      });

      await Promise.all([authUpdatePromise, firestoreUpdatePromise]);
      
      toast({ title: "Profile Updated", description: "Your changes have been saved." });
      form.reset(values, { keepValues: true }); // Resets dirty state but keeps new values
    } catch (error) {
      console.error("Error updating profile: ", error);
      toast({ variant: "destructive", title: "Update Failed", description: "Could not update your profile. Please try again." });
    }
  };
  
  const handlePasswordReset = async () => {
    if (!user?.email || !auth) return;
    setIsPasswordResetting(true);
    try {
        await sendPasswordResetEmail(auth, user.email);
        toast({
            title: "Password Reset Email Sent",
            description: `A password reset link has been sent to ${user.email}.`,
        });
    } catch (error) {
        console.error("Error sending password reset email", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not send password reset email. Please try again.",
        });
    } finally {
        setIsPasswordResetting(false);
    }
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

  const isPasswordUser = user.providerData.some(p => p.providerId === 'password');

  return (
    <div className="mx-auto max-w-2xl w-full h-full p-4 sm:p-8">
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
              <FormField
                control={form.control}
                name="photoURL"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Photo URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/your-photo.png" {...field} />
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

          {isPasswordUser && (
            <>
              <Separator />
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Password</h3>
                  <p className="text-sm text-muted-foreground">
                    To change your password, send a reset link to your email.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handlePasswordReset}
                  disabled={isPasswordResetting}
                >
                  {isPasswordResetting ? 'Sending...' : 'Send Password Reset Email'}
                </Button>
              </div>
            </>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
