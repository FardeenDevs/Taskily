
import { type Timestamp } from "firebase/firestore";

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
    ownerId: string;
    notesPassword?: string | null;
    notesBackupCodes?: string[] | null;
    showPriority?: boolean;
    showEffort?: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Timestamp | string;
  workspaceId: string;
  isNew?: boolean; // Optional flag for temporary client-side notes
}

export interface AppSettings {
  defaultPriority: Priority;
  defaultEffort: Effort;
  defaultWorkspaceId: string | null;
}

export const priorityMap: Record<Priority, { value: number }> = {
    "P1": { value: 1 },
    "P2": { value: 2 },
    "P3": { value: 3 },
    "P4": { value: 4 },
    "P5": { value: 5 },
};

export const effortMap: Record<Effort, { value: number }> = {
    "E1": { value: 1 },
    "E2": { value: 2 },
    "E3": { value: 3 },
    "E4": { value: 4 },
    "E5": { value: 5 },
};
