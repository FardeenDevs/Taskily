
"use client"

import { memo, useState } from "react"
import { useTheme } from "next-themes"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Sun, Moon, Trash2, UserX } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onResetApp: () => void
  onDeleteAccount: () => Promise<void>
}

export const SettingsDialog = memo(function SettingsDialog({ open, onOpenChange, onResetApp, onDeleteAccount }: SettingsDialogProps) {
  const { theme, setTheme } = useTheme()
  const [isDark, setIsDark] = useState(theme === 'dark');

  const handleThemeChange = (checked: boolean) => {
    const newTheme = checked ? 'dark' : 'light';
    setIsDark(checked);
    setTheme(newTheme);
  }

  const handleReset = () => {
    onResetApp();
    onOpenChange(false);
  }

  const handleDeleteAccount = async () => {
    await onDeleteAccount();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your application settings and preferences.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <Label htmlFor="dark-mode" className="text-base">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                        Toggle between light and dark themes.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Sun className="h-5 w-5 text-yellow-500"/>
                    <Switch
                        id="dark-mode"
                        checked={isDark}
                        onCheckedChange={handleThemeChange}
                    />
                    <Moon className="h-5 w-5 text-blue-500"/>
                </div>
            </div>

            <div className="flex flex-col gap-4 rounded-lg border border-destructive/50 p-4">
                 <div className="space-y-0.5">
                    <Label className="text-base text-destructive">Danger Zone</Label>
                    <p className="text-sm text-muted-foreground">
                       These actions are permanent and cannot be undone.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-sm text-muted-foreground flex-1 text-center sm:text-left">Reset all lists, tasks, and notes.</p>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="w-full sm:w-auto">
                                <Trash2 className="mr-2 h-4 w-4"/>
                                Reset Application
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete all tasks, notes, and listspaces. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleReset} variant="destructive">
                                    Yes, reset everything
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
                 <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-sm text-muted-foreground flex-1 text-center sm:text-left">Delete your account and all data.</p>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="w-full sm:w-auto">
                                <UserX className="mr-2 h-4 w-4"/>
                                Delete Account
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This is permanent. All your data, including your profile, lists, tasks, and notes will be deleted forever. This cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteAccount} variant="destructive">
                                    Yes, delete my account
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
});
