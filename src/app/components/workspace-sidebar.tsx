
"use client";

import { useState, useEffect } from "react";
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
import { Plus, MoreVertical, Pencil, Trash2, LayoutGrid, Archive, ShieldAlert } from "lucide-react";
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

type WorkspaceSidebarProps = {
  tasksHook: ReturnType<typeof useTasks>;
};

export function WorkspaceSidebar({ tasksHook }: WorkspaceSidebarProps) {
  const { 
    workspaces, 
    activeWorkspaceId, 
    switchWorkspace, 
    addWorkspace, 
    editWorkspace, 
    deleteWorkspace, 
    clearTasks,
    setWorkspacePassword
  } = tasksHook;
  const { setOpen } = useSidebar();
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const [editName, setEditName] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordHint, setPasswordHint] = useState("");

  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);

  useEffect(() => {
    if (selectedWorkspace) {
      setPasswordHint(selectedWorkspace.passwordHint || "");
    }
  }, [selectedWorkspace])

  const handleAddWorkspace = () => {
    addWorkspace(newWorkspaceName);
    setNewWorkspaceName("");
  };
  
  const handleEditWorkspace = () => {
    if (selectedWorkspace) {
      editWorkspace(selectedWorkspace.id, editName);
    }
    setEditDialogOpen(false);
    setSelectedWorkspace(null);
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
  
  const handleSetPassword = () => {
    if (selectedWorkspace) {
      if (newPassword !== confirmPassword) {
        alert("New passwords do not match."); // Replace with a proper toast/notification
        return;
      }
      const success = setWorkspacePassword(selectedWorkspace.id, oldPassword, newPassword, passwordHint);
      if (success) {
        closePasswordDialog();
      }
    }
  };

  const handleRemovePassword = () => {
    if (selectedWorkspace) {
      const success = setWorkspacePassword(selectedWorkspace.id, oldPassword, null, null);
      if (success) {
        closePasswordDialog();
      }
    }
  }

  const openEditDialog = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setEditName(workspace.name);
    setEditDialogOpen(true);
  }

  const openPasswordDialog = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setPasswordDialogOpen(true);
  }

  const closePasswordDialog = () => {
    setPasswordDialogOpen(false);
    setSelectedWorkspace(null);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordHint("");
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
                onClick={() => {
                  switchWorkspace(workspace.id);
                  setOpen(false);
                }}
              >
                {workspace.name}
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
                        <span>Edit Name</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => openPasswordDialog(workspace)}>
                        <ShieldAlert className="mr-2 h-4 w-4" />
                        <span>Manage Password</span>
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

       {/* Edit Name Dialog */}
       <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Listspace Name</DialogTitle>
            </DialogHeader>
            <div className="py-4">
                <Label htmlFor="workspace-name">Name</Label>
                <Input id="workspace-name" value={editName} onChange={(e) => setEditName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleEditWorkspace()} />
            </div>
            <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleEditWorkspace}>Save</Button>
            </DialogFooter>
            </DialogContent>
        </Dialog>
        
        {/* Set/Change Password Dialog */}
        <Dialog open={passwordDialogOpen} onOpenChange={closePasswordDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Manage Password for '{selectedWorkspace?.name}'</DialogTitle>
                     <DialogDescription>
                        {selectedWorkspace?.password ? "Change or remove the password for this listspace." : "Set a new password to protect this listspace."}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    {selectedWorkspace?.password && (
                      <div>
                          <Label htmlFor="old-password">Old Password</Label>
                          <Input id="old-password" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                      </div>
                    )}
                    <div>
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder={selectedWorkspace?.password ? "Leave blank to keep current" : ""}/>
                    </div>
                     <div>
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="password-hint">Password Hint (Optional)</Label>
                        <Input id="password-hint" type="text" value={passwordHint} onChange={(e) => setPasswordHint(e.target.value)} />
                    </div>
                </div>
                <DialogFooter className="sm:justify-between gap-2">
                    {selectedWorkspace?.password ? (
                      <Button onClick={handleRemovePassword} variant="destructive" className="w-full sm:w-auto">Remove Password</Button>
                    ) : <div></div>}
                    <div className="flex gap-2">
                      <Button type="button" variant="secondary" onClick={closePasswordDialog}>Cancel</Button>
                      <Button onClick={handleSetPassword}>Save Password</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>

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
                <AlertDialogDescription>
                    This will permanently delete all tasks and notes in this listspace. This action cannot be undone.
                </AlertDialogDescription>
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
