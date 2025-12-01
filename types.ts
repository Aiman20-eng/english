export interface Task {
  id: string;
  text: string;
  completed: boolean;
  weekId: string;
  createdAt: number;
}

export interface WeeklySubmission {
  id: string;
  weekId: string;
  studentName: string;
  completedTaskIds: string[];
  audioBase64: string | null; // Storing as base64 for local demo purposes
  timestamp: number;
  feedback?: string;
}

export interface Week {
  id: string;
  title: string;
  createdAt: number;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT'
}
