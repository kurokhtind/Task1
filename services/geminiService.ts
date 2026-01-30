import { TaskPriority } from "../types";

// AI features removed.
// This file is kept as a stub to maintain project structure if needed in future updates.

export const breakDownGoal = async (goal: string): Promise<{ title: string; priority: TaskPriority; xp: number }[]> => {
  return [];
};

export interface DailySummary {
    rank: string; 
    title: string;
    message: string;
}

export const generateDailySummary = async (completed: string[], pending: string[]): Promise<DailySummary | null> => {
    return null;
};