import { UserStats, Achievement } from '../types';
import { Target, Zap, Crown, Medal, Flame } from 'lucide-react';

export const GLOBAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'beginner',
    title: 'Новичок',
    description: 'Выполните первые 5 задач',
    icon: Target,
    color: 'from-green-400 via-emerald-400 to-green-500',
    check: (stats: UserStats) => stats.totalTasksCompleted >= 5,
    reqText: '5 задач'
  },
  {
    id: 'pro',
    title: 'Опытный',
    description: 'Выполните 50 задач',
    icon: Zap,
    color: 'from-blue-400 via-indigo-400 to-blue-500',
    check: (stats: UserStats) => stats.totalTasksCompleted >= 50,
    reqText: '50 задач'
  },
  {
    id: 'legend',
    title: 'Легенда',
    description: 'Выполните 100 задач',
    icon: Crown,
    color: 'from-yellow-300 via-orange-400 to-yellow-500',
    check: (stats: UserStats) => stats.totalTasksCompleted >= 100,
    reqText: '100 задач'
  },
  {
    id: 'level5',
    title: 'Мастер',
    description: 'Достигните 5 уровня',
    icon: Medal,
    color: 'from-purple-400 via-pink-400 to-purple-500',
    check: (stats: UserStats) => stats.level >= 5,
    reqText: '5 уровень'
  },
  {
    id: 'level10',
    title: 'Грандмастер',
    description: 'Достигните 10 уровня',
    icon: Medal,
    color: 'from-red-400 via-rose-400 to-red-500',
    check: (stats: UserStats) => stats.level >= 10,
    reqText: '10 уровень'
  },
  {
    id: 'streak3',
    title: 'В фокусе',
    description: 'Поддерживайте стрик 3 дня',
    icon: Flame,
    color: 'from-orange-400 via-red-400 to-orange-500',
    check: (stats: UserStats) => stats.streakDays >= 3,
    reqText: 'Стрик 3'
  },
  {
    id: 'streak7',
    title: 'В огне',
    description: 'Поддерживайте стрик 7 дней',
    icon: Flame,
    color: 'from-red-500 via-pink-500 to-red-600',
    check: (stats: UserStats) => stats.streakDays >= 7,
    reqText: 'Стрик 7'
  }
];