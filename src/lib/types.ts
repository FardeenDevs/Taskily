export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  workspaceId: string;
}

export interface Workspace {
    id: string;
    name: string;
    createdAt: string;
}
