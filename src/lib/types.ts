export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export interface UserProfile {
    username: string;
    email: string;
}
