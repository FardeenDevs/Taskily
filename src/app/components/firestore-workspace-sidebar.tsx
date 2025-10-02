
"use client";

import { useState } from "react";
import { type useTasks } from "@/lib/hooks/use-tasks";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, MoreVertical, Pencil, Trash2, LayoutGrid, Archive, Lock, Eye, EyeOff } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Workspace } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";

type WorkspaceSidebarProps = {
  tasksHook: ReturnType<typeof useTasks>;
};

export function FirestoreWorkspaceSidebar({ tasksHook }: WorkspaceSidebarProps) {
  const { 
    workspaces, 
    activeWorkspaceId, 
    switchWorkspace, 
    addWorkspace, 
    editWorkspace, 
    deleteWorkspace, 
    clearWorkspace,
    setNotesPassword,
    removeNotesPassword,
  } = tasksHook;
  const { setOpen } = useSidebar();
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  
  const { toast } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  
  const [editName, setEditName] = useState("");
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);

  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleAddWorkspace = () => {
    addWorkspace(newWorkspaceName);
    setNewWorkspaceName("");
  };
  
  const handleSaveChanges = () => {
    if (selectedWorkspace) {
      // Handle name change
      if (editName !== selectedWorkspace.name) {
        editWorkspace(selectedWorkspace.id, editName);
      }

      // Handle password protection
      if (isPasswordProtected) {
         if (password) {
            if (password !== confirmPassword) {
                toast({ variant: "destructive", title: "Passwords do not match." });
                return;
            }
            if (password.length < 4) {
                toast({ variant: "destructive", title: "Password too short.", description: "Password must be at least 4 characters." });
                return;
            }
            setNotesPassword(selectedWorkspace.id, password);
         }
      } else if (selectedWorkspace.notesPassword) {
        removeNotesPassword(selectedWorkspace.id);
      }
      
      setEditDialogOpen(false);
      toast({ title: "Listspace updated!" });
    }
  };
  
  const handleDeleteWorkspace = () => {
    if(selectedWorkspace) {
      deleteWorkspace(selectedWorkspace.id)
    }
    setDeleteDialogOpen(false);
    setSelectedWorkspace(null);
  }

  const handleClearWorkspace = () => {
    if (selectedWorkspace) {
        clearWorkspace(selectedWorkspace.id);
    }
    setClearDialogOpen(false);
    setSelectedWorkspace(null);
  };

  const openEditDialog = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setEditName(workspace.name);
    setIsPasswordProtected(!!workspace.notesPassword);
    setPassword("");
    setConfirmPassword("");
    setEditDialogOpen(true);
  }

  return (
    <Sidebar>
      <SidebarHeader>
          <div className="flex items-center justify-center gap-2">
            <LayoutGrid className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Listspaces</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {workspaces.map((workspace) => (
            <SidebarMenuItem key={workspace.id}>
              <SidebarMenuButton
                isActive={workspace.id === activeWorkspaceId}
                onClick={() => switchWorkspace(workspace.id)}
              >
                <span className="truncate flex-1">{workspace.name}</span>
                {workspace.notesPassword && <Lock className="h-3 w-3 text-muted-foreground ml-2" />}
              </SidebarMenuButton>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction>
                    <MoreVertical />
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => openEditDialog(workspace)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => { setSelectedWorkspace(workspace); setClearDialogOpen(true); }}>
                        <Archive className="mr-2 h-4 w-4" />
                        <span>Clear All Items</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => { setSelectedWorkspace(workspace); setDeleteDialogOpen(true); }} className="text-destructive focus:bg-destructive focus:text-destructive-foreground">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarGroup>
        <div className="flex items-center gap-2">
          <Input
            placeholder="New Listspace..."
            value={newWorkspaceName}
            onChange={(e) => setNewWorkspaceName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddWorkspace()}
          />
          <Button size="icon" variant="outline" onClick={handleAddWorkspace} disabled={!newWorkspaceName.trim()}>
            <Plus />
          </Button>
        </div>
      </SidebarGroup>

       <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>Edit Listspace</DialogTitle>
                <DialogDescription>
                    Manage the listspace name and notes protection.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="workspace-name">Name</Label>
                    <Input id="workspace-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>
                <div className="space-y-4 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="protect-notes" className="text-base">Protect Notes</Label>
                            <p className="text-sm text-muted-foreground">
                                Secure notes with a password.
                            </p>
                        </div>
                        <Switch
                            id="protect-notes"
                            checked={isPasswordProtected}
                            onCheckedChange={setIsPasswordProtected}
                        />
                    </div>
                    {isPasswordProtected && (
                        <div className="space-y-4 pt-2">
                            {selectedWorkspace?.notesPassword && (
                                <Alert variant="destructive">
                                    <AlertDescription>
                                        Changing the password will invalidate your old backup codes. New codes will be generated.
                                    </AlertDescription>
                                </Alert>
                            )}
                            <div className="space-y-2 relative">
                                <Label htmlFor="password">
                                    {selectedWorkspace?.notesPassword ? "New Password" : "Password"}
                                </Label>
                                <Input 
                                    id="password" 
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Must be at least 4 characters"
                                />
                                <Button variant="ghost" size="icon" className="absolute right-1 top-6 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff /> : <Eye />}
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm Password</Label>
                                <Input 
                                    id="confirm-password" 
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveChanges}>Save Changes</Button>
            </DialogFooter>
            </DialogContent>
        </Dialog>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the listspace and all its items. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteWorkspace} variant="destructive">
                        Yes, delete it
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will permanently delete all tasks and notes in this listspace. This action cannot be undone.
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
    </Sidebar>
  );
}

    