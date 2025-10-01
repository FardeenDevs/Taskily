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
import { Plus, MoreVertical, Pencil, Trash2, LayoutGrid } from "lucide-react";
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
  const { workspaces, activeWorkspaceId, switchWorkspace, addWorkspace, editWorkspace, deleteWorkspace } = tasksHook;
  const { setOpen } = useSidebar();
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
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
  };

  return (
    <Dialog>
      <AlertDialog>
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
                      <DialogTrigger asChild>
                        <DropdownMenuItem onSelect={() => { setSelectedWorkspaceId(workspace.id); setEditName(workspace.name)}}>
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                      </DialogTrigger>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={() => setSelectedWorkspaceId(workspace.id)} className="text-destructive hover:bg-destructive/10 focus:text-destructive focus:bg-destructive/10">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
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
        </Sidebar>

        {/* Edit Dialog */}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Listspace</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="workspace-name">Name</Label>
            <Input id="workspace-name" value={editName} onChange={(e) => setEditName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleEditWorkspace()} />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button onClick={handleEditWorkspace}>Save</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
        
        {/* Delete Alert Dialog */}
        <AlertDialogContent>
          <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                  This will permanently delete this Listspace and all its tasks. This action cannot be undone.
              </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => selectedWorkspaceId && deleteWorkspace(selectedWorkspaceId)} className="bg-red-600 hover:bg-red-700 text-white">
                  Yes, delete it
              </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
