
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
import { Plus, MoreVertical, Pencil, Trash2, LayoutGrid, Archive } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";

type WorkspaceSidebarProps = {
  tasksHook: ReturnType<typeof useTasks>;
};

export function WorkspaceSidebar({ tasksHook }: WorkspaceSidebarProps) {
  const { workspaces, activeWorkspaceId, switchWorkspace, addWorkspace, editWorkspace, deleteWorkspace, clearTasks } = tasksHook;
  const { setOpen } = useSidebar();
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const [editName, setEditName] = useState("");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);

  const handleAddWorkspace = () => {
    addWorkspace(newWorkspaceName);
    setNewWorkspaceName("");
  };
  
  const handleEditWorkspace = () => {
    if (selectedWorkspaceId) {
      editWorkspace(selectedWorkspaceId, editName);
    }
    setEditDialogOpen(false);
    setSelectedWorkspaceId(null);
  };
  
  const handleDeleteWorkspace = () => {
    if(selectedWorkspaceId) {
      deleteWorkspace(selectedWorkspaceId)
    }
    setDeleteDialogOpen(false);
    setSelectedWorkspaceId(null);
  }

  const handleClearTasks = () => {
    if (selectedWorkspaceId) {
        clearTasks(selectedWorkspaceId);
    }
    setClearDialogOpen(false);
    setSelectedWorkspaceId(null);
  };

  const openEditDialog = (workspace: {id: string, name: string}) => {
    setSelectedWorkspaceId(workspace.id);
    setEditName(workspace.name);
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
                        <span>Edit</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onSelect={() => { setSelectedWorkspaceId(workspace.id); setClearDialogOpen(true); }}>
                        <Archive className="mr-2 h-4 w-4" />
                        <span>Clear All Tasks</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem onSelect={() => { setSelectedWorkspaceId(workspace.id); setDeleteDialogOpen(true); }} className="text-destructive focus:bg-destructive focus:text-destructive-foreground">
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
            <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Listspace</DialogTitle>
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
        
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the listspace and all its tasks. This action cannot be undone.
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
                    This will permanently delete all tasks in this list. This action cannot be undone.
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
