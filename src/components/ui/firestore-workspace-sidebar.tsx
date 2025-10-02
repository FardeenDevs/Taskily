
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
import { Plus, MoreVertical, Pencil, Trash2, LayoutGrid, Archive, Lock, Unlock, Copy, Check } from "lucide-react";
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Workspace } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/firebase";
import { BackupCodesDialog } from "./backup-codes-dialog";


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
    clearTasks,
  } = tasksHook;
  const { setOpen } = useSidebar();
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  
  const { user } = useUser();
  const { toast } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);

  
  const [editName, setEditName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordHint, setNewPasswordHint] = useState("");
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);

  const handleAddWorkspace = () => {
    addWorkspace(newWorkspaceName);
    setNewWorkspaceName("");
  };
  
  const handleEditWorkspace = () => {
    if (selectedWorkspace) {
      const { success, newBackupCodes } = editWorkspace(selectedWorkspace.id, editName, currentPassword, newPassword, newPasswordHint);
      if (success) {
        setEditDialogOpen(false);
        setSelectedWorkspace(null);
        toast({ title: "Listspace updated!" });
        if (newBackupCodes) {
            setBackupCodes(newBackupCodes);
        }
      } else {
        toast({ variant: "destructive", title: "Incorrect Current Password" });
      }
    }
  };
  
  const handleDeleteWorkspace = () => {
    if(selectedWorkspace) {
      deleteWorkspace(selectedWorkspace.id)
    }
    setDeleteDialogOpen(false);
    setSelectedWorkspace(null);
  }

  const handleClearTasks = () => {
    if (selectedWorkspace) {
        clearTasks(selectedWorkspace.id);
    }
    setClearDialogOpen(false);
    setSelectedWorkspace(null);
  };

  const openEditDialog = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setEditName(workspace.name);
    setCurrentPassword("");
    setNewPassword("");
    setNewPasswordHint(workspace.passwordHint || "");
    setEditDialogOpen(true);
  }
  
  const closeBackupDialog = () => {
    setBackupCodes(null);
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
                {workspace.password ? <Lock className="h-4 w-4 text-muted-foreground" /> : <Unlock className="h-4 w-4 text-muted-foreground/50" />}
                <span className="truncate">{workspace.name}</span>
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
                        <span>Edit / Password</span>
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

       {/* Edit Name / Password Dialog */}
       <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Listspace</DialogTitle>
                <DialogDescription>
                    Manage the listspace name and password. Leave the new password field blank to remove an existing password.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="workspace-name">Name</Label>
                    <Input id="workspace-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>
                 {selectedWorkspace?.password && (
                    <div className="space-y-2">
                        <Label htmlFor="workspace-current-password">Current Password</Label>
                        <Input id="workspace-current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password"/>
                    </div>
                 )}
                 <div className="space-y-2">
                    <Label htmlFor="workspace-new-password">New Password (optional)</Label>
                    <Input id="workspace-new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Leave blank to remove"/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="workspace-password-hint">Password Hint (optional)</Label>
                    <Input id="workspace-password-hint" value={newPasswordHint} onChange={(e) => setNewPasswordHint(e.target.value)} placeholder="e.g., My first pet's name" />
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleEditWorkspace}>Save</Button>
            </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Backup Codes Dialog */}
        <BackupCodesDialog codes={backupCodes} open={!!backupCodes} onOpenChange={closeBackupDialog} />

        {/* Delete Workspace Dialog */}
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

        {/* Clear Tasks Dialog */}
        <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <DialogDescription>
                    This will permanently delete all tasks and notes in this listspace. This action cannot be undone.
                </DialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearTasks} variant="destructive">
                    Yes, clear all
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </Sidebar>
  );
}
