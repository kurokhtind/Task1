import React, { useMemo } from 'react';
import { Task, TaskPriority, TaskType, UserStats } from '../types';
import { X, Trophy, Coins, Target, CalendarCheck, Flame, Repeat, BarChart as BarChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface DailySummaryModalProps {
  tasks: Task[];
  stats: UserStats;
  onClose: () => void;
}

const DailySummaryModal: React.FC<DailySummaryModalProps> = ({ tasks, stats: userStats, onClose }) => {
  const todayStr = new Date().toLocaleDateString('ru-RU', {
      day: 'numeric', month: 'long', year: 'numeric'
  });
  
  const isoToday = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const todayDay = new Date().getDay() === 0 ? 0 : new Date().getDay(); // Match app logic (0=Sun) but verify app logic for habits (App uses 0=Sun in types but 1-7 in UI, need to match logic in habits filter)
  // App.tsx: 1=Mon...7=Sun is visually, but recurringDays store JS getDay()?
  // In App.tsx: ['Пн', 'Вт'...] mapped to index. jsDay = index===6 ? 0 : index+1. So 1=Mon, 0=Sun.
  // Date.getDay(): 0=Sun, 1=Mon.
  const appDay = new Date().getDay(); // 0-6 Sun-Sat.

  // Calculate Daily Stats
  const stats = useMemo(() => {
      let completedCount = 0;
      let totalXp = 0;
      let totalCoins = 0;
      let incomeByPriority = [
          { name: 'Выс.', xp: 0, coins: 0 },
          { name: 'Сред.', xp: 0, coins: 0 },
          { name: 'Низ.', xp: 0, coins: 0 },
      ];

      tasks.forEach(task => {
          let isCompletedToday = false;

          if (task.type === TaskType.RECURRING) {
              if (task.completedDates?.some(d => d.startsWith(isoToday))) {
                  isCompletedToday = true;
              }
          } else {
              if (task.isCompleted && task.completedAt) {
                  const completedDate = new Date(task.completedAt).toISOString().split('T')[0];
                  if (completedDate === isoToday) {
                      isCompletedToday = true;
                  }
              }
          }

          if (isCompletedToday) {
              completedCount++;
              totalXp += task.xpValue;
              totalCoins += task.coinReward;
              
              if (task.priority === TaskPriority.HIGH) { incomeByPriority[0].xp += task.xpValue; incomeByPriority[0].coins += task.coinReward; }
              if (task.priority === TaskPriority.MEDIUM) { incomeByPriority[1].xp += task.xpValue; incomeByPriority[1].coins += task.coinReward; }
              if (task.priority === TaskPriority.LOW) { incomeByPriority[2].xp += task.xpValue; incomeByPriority[2].coins += task.coinReward; }
          }
      });

      return { completedCount, totalXp, totalCoins, incomeByPriority };
  }, [tasks, isoToday]);

  // Habit Stats
  const habitStats = useMemo(() => {
      const habitsToday = tasks.filter(t => t.type === TaskType.RECURRING && t.recurringDays?.includes(appDay));
      const habitsDone = habitsToday.filter(h => h.completedDates?.some(d => d.startsWith(isoToday))).length;
      return { total: habitsToday.length, done: habitsDone };
  }, [tasks, appDay, isoToday]);

  // Burned Items Stats
  const burnedToday = useMemo(() => {
      if (!userStats.burnedHistory) return [];
      return userStats.burnedHistory.filter(item => {
          const burnedDate = new Date(item.burnedAt).toISOString().split('T')[0];
          return burnedDate === isoToday;
      });
  }, [userStats.burnedHistory, isoToday]);

  const habitChartData = [
      { name: 'Выполнено', value: habitStats.done, color: '#22c55e' },
      { name: 'Осталось', value: habitStats.total - habitStats.done, color: '#e5e7eb' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 transition-colors flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="relative bg-indigo-600 dark:bg-indigo-900 p-5 text-white text-center flex-shrink-0">
             <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
             <button onClick={onClose} className="absolute top-4 right-4 p-1 bg-white/20 rounded-full hover:bg-white/30 transition-colors z-10">
                 <X className="w-5 h-5 text-white" />
             </button>
             <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-200 mb-0.5 relative z-10">Итог дня</h2>
             <h1 className="text-xl font-black relative z-10">{todayStr}</h1>
        </div>

        <div className="p-5 overflow-y-auto space-y-6 flex-1">
            
            {/* Top Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
                 <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/40 dark:to-indigo-800/40 rounded-2xl p-3 border border-indigo-100 dark:border-indigo-800 flex flex-col items-center justify-center">
                     <div className="text-xs font-bold text-indigo-500 dark:text-indigo-300 uppercase mb-1 flex items-center gap-1">
                        <Trophy className="w-3 h-3" /> XP
                     </div>
                     <div className="text-2xl font-black text-indigo-700 dark:text-indigo-200">+{stats.totalXp}</div>
                 </div>
                 <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/40 dark:to-yellow-800/40 rounded-2xl p-3 border border-yellow-100 dark:border-yellow-800 flex flex-col items-center justify-center">
                     <div className="text-xs font-bold text-yellow-600 dark:text-yellow-400 uppercase mb-1 flex items-center gap-1">
                        <Coins className="w-3 h-3" /> Монеты
                     </div>
                     <div className="text-2xl font-black text-yellow-700 dark:text-yellow-200">+{stats.totalCoins}</div>
                 </div>
            </div>

            {/* Income Chart */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <BarChartIcon className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Источник дохода</h3>
                </div>
                <div className="h-32 w-full text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.incomeByPriority}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px'}} />
                        <Bar dataKey="xp" fill="#6366f1" radius={[4, 4, 0, 0]} name="XP" />
                        <Bar dataKey="coins" fill="#eab308" radius={[4, 4, 0, 0]} name="Coins" />
                    </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Habit Tracker Stats */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm flex items-center justify-between relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                        <Repeat className="w-4 h-4 text-green-500" />
                        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Привычки</h3>
                    </div>
                    <div className="text-2xl font-black text-gray-800 dark:text-gray-100">
                        {habitStats.done} <span className="text-gray-300 text-lg">/ {habitStats.total}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1">
                        {habitStats.total > 0 && habitStats.done === habitStats.total ? "Все выполнено! 🎉" : "Есть куда расти"}
                    </div>
                </div>
                
                {/* Mini Pie Chart for Habits */}
                <div className="w-16 h-16 relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={habitChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={20}
                            outerRadius={30}
                            dataKey="value"
                            stroke="none"
                        >
                            {habitChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Burned Rewards */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
                 <div className="flex items-center gap-2 mb-3">
                    <Flame className="w-4 h-4 text-red-500" />
                    <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Сожженные награды</h3>
                </div>
                {burnedToday.length === 0 ? (
                    <div className="text-center py-4 text-xs text-gray-400 dark:text-gray-500">
                        Сегодня вы ничего не использовали.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {burnedToday.map((item) => (
                            <div key={item.instanceId} className="flex justify-between items-center text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <span className="font-medium text-gray-700 dark:text-gray-200">{item.title}</span>
                                <span className="text-xs font-bold text-yellow-600 dark:text-yellow-500 flex items-center gap-1">
                                    -{item.cost} <Coins className="w-3 h-3" />
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="text-center pt-2">
                <p className="text-xs text-gray-400 italic">"Завтра будет новый день, чтобы стать лучше!"</p>
            </div>
        </div>
        
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex-shrink-0">
            <button 
                onClick={onClose}
                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-transform active:scale-95"
            >
                Закрыть
            </button>
        </div>

      </div>
    </div>
  );
};

export default DailySummaryModal;