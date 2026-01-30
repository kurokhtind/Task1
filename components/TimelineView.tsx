import React, { useState, useEffect } from 'react';
import { Task, TaskType } from '../types';
import TaskItem from './TaskItem';
import { Clock, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

interface TimelineViewProps {
  tasks: Task[];
  onToggle: (id: string, dateContext?: string) => void;
  onClick: (task: Task) => void;
  selectedDateStr: string;
  onDateSelect: (date: string) => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({ tasks, onToggle, onClick, selectedDateStr, onDateSelect }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
      // Update time every minute
      const timer = setInterval(() => setCurrentTime(new Date()), 60000);
      return () => clearInterval(timer);
  }, []);
  
  // Navigation helpers
  const handlePrevDay = () => {
    const d = new Date(selectedDateStr);
    d.setDate(d.getDate() - 1);
    onDateSelect(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDateStr);
    d.setDate(d.getDate() + 1);
    onDateSelect(d.toISOString().split('T')[0]);
  };

  const formattedDate = new Date(selectedDateStr).toLocaleDateString('ru-RU', {
      weekday: 'short', day: 'numeric', month: 'long'
  });

  // Filter tasks that have a specific time for the selected date
  const timelineTasks = tasks.filter(task => {
      // 1. Check if task belongs to this date
      let isForDate = false;
      if (task.type === TaskType.RECURRING) {
          const dayOfWeek = new Date(selectedDateStr).getDay();
          // App uses 0=Sun, 1=Mon logic for Date.getDay()
          isForDate = task.recurringDays?.includes(dayOfWeek) || false;
      } else {
          if (!task.deadline) return false;
          isForDate = task.deadline.startsWith(selectedDateStr);
      }

      if (!isForDate) return false;

      // 2. Check if it has time
      if (!task.deadline) return false;
      
      const hasTime = task.deadline.includes('T') || (task.type === TaskType.RECURRING && task.deadline.includes(':') && task.deadline.length === 5);
      return hasTime;
  });

  const getTaskTime = (t: Task) => {
      if (t.type === TaskType.RECURRING) return t.deadline || '00:00';
      return t.deadline ? t.deadline.split('T')[1] : '00:00';
  };

  // Define Items for rendering
  type TimelineItem = 
    | { type: 'task'; data: Task; time: string }
    | { type: 'now'; time: string };

  let items: TimelineItem[] = timelineTasks.map(t => ({ type: 'task', data: t, time: getTaskTime(t) }));

  // Add "Now" marker if selected date is today
  const todayStr = currentTime.toISOString().split('T')[0];
  if (selectedDateStr === todayStr) {
      const nowTimeStr = currentTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      items.push({ type: 'now', time: nowTimeStr });
  }

  // Sort items
  items.sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="animate-fade-in pb-24">
       {/* Date Header */}
       <div className="flex items-center justify-between mb-6 bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 sticky top-0 z-10">
            <button onClick={handlePrevDay} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ежедневник</span>
                <span className="text-lg font-black text-gray-800 dark:text-gray-100 capitalize">{formattedDate}</span>
            </div>
            <button onClick={handleNextDay} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
       </div>

       {items.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 opacity-50">
               <Clock className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
               <p className="text-gray-500 dark:text-gray-400 font-medium">Нет задач по времени</p>
               <p className="text-xs text-gray-400">Добавьте задачу с указанием времени</p>
           </div>
       ) : (
           <div className="relative pl-4">
               {/* Vertical Line */}
               <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-indigo-100 dark:bg-indigo-900/30"></div>

               {items.map((item, index) => {
                   if (item.type === 'now') {
                       return (
                           <div key="now-marker" className="relative pl-8 mb-8 flex items-center group z-20">
                               {/* Time Bubble for Now */}
                               <div className="absolute left-0 w-12 flex items-center justify-center z-20">
                                   <div className="bg-red-500 text-[10px] font-bold text-white px-2 py-1 rounded-full shadow-md animate-pulse">
                                       {item.time}
                                   </div>
                               </div>
                               
                               {/* Red Line */}
                               <div className="w-full h-0.5 bg-red-500/50 relative flex items-center">
                                   <div className="absolute -left-[10px] w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-950"></div>
                                   <div className="absolute right-0 text-[10px] font-bold text-red-500 bg-white dark:bg-gray-950 px-2 uppercase tracking-widest">
                                       Сейчас
                                   </div>
                               </div>
                           </div>
                       )
                   }
                   
                   const task = item.data!;
                   return (
                       <div key={task.id} className="relative pl-8 mb-6 group">
                           {/* Time Bubble */}
                           <div className="absolute left-0 top-3 w-12 flex items-center justify-center z-10">
                               <div className="bg-indigo-50 dark:bg-indigo-900 border border-indigo-200 dark:border-indigo-700 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded-md shadow-sm">
                                   {item.time}
                               </div>
                           </div>
                           
                           {/* Connector Dot */}
                           <div className="absolute left-[22px] top-8 w-2 h-2 bg-indigo-500 rounded-full ring-4 ring-white dark:ring-gray-950 z-10"></div>

                           <div className="transform transition-transform group-hover:translate-x-1">
                               <TaskItem 
                                    task={task}
                                    onToggle={onToggle}
                                    onClick={onClick}
                                    dateContext={selectedDateStr}
                               />
                           </div>
                       </div>
                   );
               })}
           </div>
       )}
    </div>
  );
};

export default TimelineView;