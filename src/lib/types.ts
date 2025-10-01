export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export interface Workspace {
    id: string;
    name: string;
    tasks: Task[];
    createdAt: string;
}

export interface Feedback {
  id: string;
  text: string;
  createdAt: string;
}
