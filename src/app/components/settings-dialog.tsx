"use client"

import { memo, useState } from "react"
import { useTheme } from "next-themes"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Sun, Moon, Trash2 } from 'lucide-react'
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
}

export const SettingsDialog = memo(function SettingsDialog({ open, onOpenChange, onResetApp }: SettingsDialogProps) {
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

            <div className="flex items-center justify-between rounded-lg border border-destructive/50 p-4">
                 <div className="space-y-0.5">
                    <Label className="text-base text-destructive">Danger Zone</Label>
                    <p className="text-sm text-muted-foreground">
                       This will reset the entire application.
                    </p>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                            <Trash2 className="mr-2 h-4 w-4"/>
                            Reset Application
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete all tasks and Listspaces. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleReset} className="bg-red-600 hover:bg-red-700 text-white">
                                Yes, reset everything
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
});
