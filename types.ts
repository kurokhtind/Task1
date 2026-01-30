export enum TaskPriority {
  LOW = 'Низкий',
  MEDIUM = 'Средний',
  HIGH = 'Высокий'
}

export enum Tab {
  TASKS = 'TASKS',
  TIMELINE = 'TIMELINE',
  HABITS = 'HABITS',
  CALENDAR = 'CALENDAR',
  PROFILE = 'PROFILE'
}

export enum TaskType {
  ONE_TIME = 'ONE_TIME',
  RECURRING = 'RECURRING'
}

export interface Task {
  id: string;
  title: string;
  
  // For One-Time Tasks
  isCompleted: boolean; 
  deadline?: string; // YYYY-MM-DD format
  completedAt?: number; // Timestamp of completion

  // For Recurring Tasks
  type: TaskType;
  recurringDays?: number[]; // 0 = Sunday, 1 = Monday, etc.
  completedDates?: string[]; // Array of YYYY-MM-DD strings indicating when it was done

  xpValue: number;
  coinReward: number; // New: Currency reward
  priority: TaskPriority;
  createdAt: number;
  category?: string;
}

export interface InventoryItem extends Reward {
    instanceId: string; // Unique ID for this specific purchased item
    purchasedAt: number;
}

export interface BurnedItem extends InventoryItem {
    burnedAt: number;
}

export interface UserStats {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalTasksCompleted: number;
  streakDays: number;
  lastActiveDate: string; // ISO Date string
  coins: number; // New: Currency balance
  inventory: InventoryItem[];
  burnedHistory: BurnedItem[]; // History of used rewards
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  check: (stats: UserStats) => boolean;
  reqText: string;
}