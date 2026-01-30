import React, { useState } from 'react';
import { Task, TaskType } from '../types';
import TaskItem from './TaskItem';
import RecurringProgressModal from './RecurringProgressModal';
import { Repeat, CheckCircle2 } from 'lucide-react';

interface HabitsViewProps {
  tasks: Task[];
  onToggle: (id: string, dateContext?: string) => void;
  onClick: (task: Task) => void;
}

const HabitsView: React.FC<HabitsViewProps> = ({ tasks, onToggle, onClick }) => {
  const [selectedHabit, setSelectedHabit] = useState<Task | null>(null);

  // Get all recurring tasks
  const habits = tasks.filter(t => t.type === TaskType.RECURRING);
  
  // Helper for today's context
  const getLocalTodayStr = () => {
     const d = new Date();
     return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const todayStr = getLocalTodayStr();

  // Sort: Unfinished today first, then by title
  const sortedHabits = habits.sort((a, b) => {
      const isADone = a.completedDates?.some(d => d.startsWith(todayStr));
      const isBDone = b.completedDates?.some(d => d.startsWith(todayStr));
      
      if (isADone === isBDone) return a.title.localeCompare(b.title);
      return isADone ? 1 : -1;
  });

  const completionRate = habits.length > 0 
    ? Math.round((habits.filter(h => h.completedDates?.some(d => d.startsWith(todayStr))).length / habits.length) * 100) 
    : 0;

  const handleTaskClick = (task: Task) => {
      setSelectedHabit(task);
  };

  return (
    <div className="animate-fade-in pb-24">
       
       <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 mb-6 relative overflow-hidden">
           <div className="relative z-10">
               <div className="flex items-center gap-2 mb-2">
                   <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                       <Repeat className="w-5 h-5 text-green-600 dark:text-green-400" />
                   </div>
                   <h2 className="text-lg font-black text-gray-800 dark:text-gray-100">Трекер привычек</h2>
               </div>
               
               <div className="flex justify-between items-end">
                   <div>
                       <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Прогресс сегодня</p>
                       <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{completionRate}%</p>
                   </div>
                   <div className="text-right">
                       <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Всего привычек</p>
                       <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{habits.length}</p>
                   </div>
               </div>
               
               {/* Progress Bar */}
               <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full mt-4 overflow-hidden">
                   <div 
                        className="bg-green-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${completionRate}%` }}
                   ></div>
               </div>
           </div>
           
           {/* Decor */}
           <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 dark:bg-green-900/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
       </div>

       <div className="space-y-1">
           {habits.length === 0 ? (
                <div className="text-center py-10 opacity-60">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">У вас пока нет привычек.</p>
                    <p className="text-xs text-gray-400 mt-1">Создайте регулярную задачу, чтобы отслеживать её здесь.</p>
                </div>
           ) : (
               sortedHabits.map(habit => (
                   <TaskItem 
                        key={habit.id}
                        task={habit}
                        onToggle={onToggle}
                        onClick={handleTaskClick}
                        dateContext={todayStr}
                   />
               ))
           )}
       </div>

       {selectedHabit && (
           <RecurringProgressModal 
                task={selectedHabit}
                onClose={() => setSelectedHabit(null)}
           />
       )}
    </div>
  );
};

export default HabitsView;