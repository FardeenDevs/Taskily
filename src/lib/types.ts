export type Priority = "P1" | "P2" | "P3" | "P4" | "P5";
export type Effort = "E1" | "E2" | "E3" | "E4" | "E5";

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  workspaceId: string;
  priority: Priority | null;
  effort: Effort | null;
}

export interface Workspace {
    id: string;
    name: string;
    createdAt: string;
}