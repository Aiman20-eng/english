import { Task, WeeklySubmission, Week } from '../types';

const TASKS_KEY = 'app_tasks';
const SUBMISSIONS_KEY = 'app_submissions';
const WEEKS_KEY = 'app_weeks';

// --- Weeks Management ---

export const getWeeks = (): Week[] => {
  const stored = localStorage.getItem(WEEKS_KEY);
  let weeks: Week[] = stored ? JSON.parse(stored) : [];
  
  // Initialize with Week 1 if empty
  if (weeks.length === 0) {
    const defaultWeek: Week = {
      id: new Date().toISOString().slice(0, 10), // Use date as ID for simplicity
      title: 'الأسبوع الأول',
      createdAt: Date.now()
    };
    weeks.push(defaultWeek);
    localStorage.setItem(WEEKS_KEY, JSON.stringify(weeks));
  }
  
  // Sort by date (newest first usually, or oldest first)
  return weeks.sort((a, b) => b.createdAt - a.createdAt);
};

export const createWeek = (title: string): Week => {
  const weeks = getWeeks();
  const newWeek: Week = {
    id: Date.now().toString(),
    title: title,
    createdAt: Date.now()
  };
  weeks.unshift(newWeek); // Add to top
  localStorage.setItem(WEEKS_KEY, JSON.stringify(weeks));
  return newWeek;
};

// --- Tasks Management ---

export const getTasks = (weekId?: string): Task[] => {
  const stored = localStorage.getItem(TASKS_KEY);
  const allTasks: Task[] = stored ? JSON.parse(stored) : [];
  if (weekId) {
    return allTasks.filter(t => t.weekId === weekId);
  }
  return allTasks;
};

export const saveTasks = (tasks: Task[]) => {
  // We need to merge these tasks with existing tasks from OTHER weeks
  // But for simplicity in this update, we will fetch all, filter out current week's old tasks, and append new ones
  // However, the View usually passes the "Updated List" for a specific context.
  // To avoid complexity, let's assume the View passes the FULL list or we handle specific week updates carefully.
  
  // Better approach for this simple app: Overwrite specific week tasks
  // But `saveTasks` in AdminView currently replaces everything. 
  // Let's change `saveTasks` to take the WHOLE list to be safe, 
  // OR we rely on the caller to pass the complete list of ALL tasks.
  
  // Since AdminView filters tasks, passing only filtered tasks to saveTasks would delete other weeks' tasks.
  // So we must be careful. Let's make a specific helper:
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
};

export const saveTaskForWeek = (weekId: string, weekTasks: Task[]) => {
  const allTasks = getTasks(); // Get ALL tasks
  const otherWeeksTasks = allTasks.filter(t => t.weekId !== weekId);
  const newAllTasks = [...otherWeeksTasks, ...weekTasks];
  localStorage.setItem(TASKS_KEY, JSON.stringify(newAllTasks));
};

// --- Submissions Management ---

export const getSubmissions = (): WeeklySubmission[] => {
  const stored = localStorage.getItem(SUBMISSIONS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveSubmission = (submission: WeeklySubmission) => {
  const submissions = getSubmissions();
  // Replace existing submission for this week if exists, or add new
  const index = submissions.findIndex(s => s.weekId === submission.weekId);
  if (index >= 0) {
    submissions[index] = submission;
  } else {
    submissions.push(submission);
  }
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
};

export const clearData = () => {
  localStorage.removeItem(TASKS_KEY);
  localStorage.removeItem(SUBMISSIONS_KEY);
  localStorage.removeItem(WEEKS_KEY);
};
