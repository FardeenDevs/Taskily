"use client"

import { useState } from "react"
import { type Workspace } from "@/lib/types"
import { SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, LayoutGrid } from "lucide-react"
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


interface WorkspaceSidebarProps {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  onAddWorkspace: (name: string) => void;
  onSwitchWorkspace: (id: string) => void;
  onDeleteWorkspace: (id: string) => void;
}

export function WorkspaceSidebar({
  workspaces,
  activeWorkspace,
  onAddWorkspace,
  onSwitchWorkspace,
  onDeleteWorkspace,
}: WorkspaceSidebarProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");

  const handleAddWorkspace = () => {
    onAddWorkspace(newWorkspaceName);
    setNewWorkspaceName("");
    setIsAddDialogOpen(false);
  }

  return (
    <>
      <SidebarHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <LayoutGrid className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-sidebar-foreground">Taskspaces</h2>
        </div>
        <div className="hidden md:block">
            <SidebarTrigger />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {workspaces.map((ws) => (
            <SidebarMenuItem key={ws.id} className="group/menu-item">
              <SidebarMenuButton
                isActive={ws.id === activeWorkspace?.id}
                onClick={() => onSwitchWorkspace(ws.id)}
              >
                <span>{ws.name}</span>
              </SidebarMenuButton>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                   <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover/menu-item:opacity-100 text-red-500 hover:text-red-600 hover:bg-red-100"
                   >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the "{ws.name}" Taskspace and all its tasks. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDeleteWorkspace(ws.id)} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
             
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4"/>
                    New Taskspace
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Taskspace</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <Input 
                        placeholder="e.g. Homework"
                        value={newWorkspaceName}
                        onChange={(e) => setNewWorkspaceName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddWorkspace()}
                    />
                </div>
                <DialogFooter>
                    <Button onClick={handleAddWorkspace}>Create</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </SidebarFooter>
    </>
  );
}
