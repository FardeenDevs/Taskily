
"use client"

import { memo, useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Sun, Moon, Trash2, UserX } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { type Priority, type Effort, type Workspace, type AppSettings } from "@/lib/types"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onResetApp: () => void
  onDeleteAccount: () => Promise<void>
  userEmail: string | null | undefined
  workspaces: Workspace[]
  appSettings: AppSettings
  onSettingsChange: (settings: Partial<AppSettings>) => void
}

export const SettingsDialog = memo(function SettingsDialog({
  open,
  onOpenChange,
  onResetApp,
  onDeleteAccount,
  userEmail,
  workspaces,
  appSettings,
  onSettingsChange,
}: SettingsDialogProps) {
  const { theme, setTheme } = useTheme()
  const [isDark, setIsDark] = useState(theme === 'dark');

  const [isFirstDeleteAlertOpen, setIsFirstDeleteAlertOpen] = useState(false)
  const [isSecondDeleteDialogOpen, setIsSecondDeleteDialogOpen] = useState(false)
  const [deleteConfirmationEmail, setDeleteConfirmationEmail] = useState("")

  useEffect(() => {
    // Reset confirmation when the main dialog is closed
    if (!open) {
      setIsFirstDeleteAlertOpen(false);
      setIsSecondDeleteDialogOpen(false);
      setDeleteConfirmationEmail("");
    }
  }, [open]);

  const handleThemeChange = (checked: boolean) => {
    const newTheme = checked ? 'dark' : 'light';
    setIsDark(checked);
    setTheme(newTheme);
  }

  const handleReset = () => {
    onResetApp();
    onOpenChange(false);
  }

  const openSecondDeleteDialog = () => {
    setIsFirstDeleteAlertOpen(false);
    setIsSecondDeleteDialogOpen(true);
  }

  const handleConfirmDeleteAccount = async () => {
    await onDeleteAccount();
    setIsSecondDeleteDialogOpen(false);
    onOpenChange(false);
  }

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your application settings and preferences.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto pr-2">
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

            <div className="rounded-lg border p-4 space-y-4">
                 <div className="space-y-0.5">
                    <Label className="text-base">Defaults</Label>
                    <p className="text-sm text-muted-foreground">
                       Set default values for new tasks and startup.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                    <Label htmlFor="default-priority">Default Priority</Label>
                     <Select onValueChange={(value) => onSettingsChange({ defaultPriority: value as Priority })} value={appSettings.defaultPriority}>
                      <SelectTrigger className="w-full sm:w-[220px]">
                        <SelectValue placeholder="Set priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="P1">Priority 1 (Low)</SelectItem>
                        <SelectItem value="P2">Priority 2</SelectItem>
                        <SelectItem value="P3">Priority 3 (Medium)</SelectItem>
                        <SelectItem value="P4">Priority 4</SelectItem>
                        <SelectItem value="P5">Priority 5 (High)</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                    <Label htmlFor="default-effort">Default Effort</Label>
                     <Select onValueChange={(value) => onSettingsChange({ defaultEffort: value as Effort })} value={appSettings.defaultEffort}>
                      <SelectTrigger className="w-full sm:w-[220px]">
                        <SelectValue placeholder="Set effort" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="E1">Effort 1 (Very Easy)</SelectItem>
                        <SelectItem value="E2">Effort 2 (Easy)</SelectItem>
                        <SelectItem value="E3">Effort 3 (Medium)</SelectItem>
                        <SelectItem value="E4">Effort 4 (Hard)</SelectItem>
                        <SelectItem value="E5">Effort 5 (Very Hard)</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                    <Label htmlFor="default-workspace">Default Listspace</Label>
                     <Select onValueChange={(value) => onSettingsChange({ defaultWorkspaceId: value })} value={appSettings.defaultWorkspaceId ?? undefined}>
                      <SelectTrigger className="w-full sm:w-[220px]">
                        <SelectValue placeholder="Select a listspace" />
                      </SelectTrigger>
                      <SelectContent>
                        {workspaces.map(ws => (
                            <SelectItem key={ws.id} value={ws.id}>{ws.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <AlertDialog open={isFirstDeleteAlertOpen} onOpenChange={setIsFirstDeleteAlertOpen}>
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
                                <AlertDialogAction onClick={openSecondDeleteDialog} variant="destructive">
                                    Continue
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
    
    {/* Second, more serious, delete confirmation */}
    <Dialog open={isSecondDeleteDialogOpen} onOpenChange={setIsSecondDeleteDialogOpen}>
        <DialogContent>
             <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                    This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2">
                <Label htmlFor="email-confirm">Please type <span className="font-bold text-foreground">{userEmail}</span> to confirm.</Label>
                <Input 
                    id="email-confirm" 
                    type="email" 
                    value={deleteConfirmationEmail}
                    onChange={(e) => setDeleteConfirmationEmail(e.target.value)}
                    placeholder="Enter your email"
                />
            </div>
            <DialogFooter>
                <Button variant="secondary" onClick={() => setIsSecondDeleteDialogOpen(false)}>Cancel</Button>
                <Button 
                    variant="destructive"
                    onClick={handleConfirmDeleteAccount}
                    disabled={deleteConfirmationEmail !== userEmail}
                >
                    I understand the consequences, delete my account
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  )
});

    