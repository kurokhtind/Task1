import React, { useState } from 'react';
import { Task, TaskType } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import TaskItem from './TaskItem';
import RecurringProgressModal from './RecurringProgressModal';

interface CalendarViewProps {
  tasks: Task[];
  onToggle: (id: string, dateContext?: string) => void;
  onDelete: (id: string) => void;
  selectedDateStr: string;
  onDateSelect: (date: string) => void;
  onEditTask?: (task: Task) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ 
    tasks, 
    onToggle, 
    onDelete, 
    selectedDateStr, 
    onDateSelect,
    onEditTask
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRecurringTask, setSelectedRecurringTask] = useState<Task | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => {
    const day = new Date(y, m, 1).getDay();
    return day === 0 ? 6 : day - 1; 
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingArray = Array.from({ length: firstDay }, (_, i) => i);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const isTaskForDate = (task: Task, targetDateStr: string) => {
    const targetDate = new Date(targetDateStr);
    
    if (task.type === TaskType.RECURRING) {
        if (!task.recurringDays) return false;
        const dayOfWeek = targetDate.getDay(); 
        return task.recurringDays.includes(dayOfWeek);
    } else {
        if (!task.deadline) return false;
        return task.deadline.startsWith(targetDateStr);
    }
  };

  const getTaskCountForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter(t => isTaskForDate(t, dateStr)).length;
  };

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onDateSelect(dateStr);
  };

  const handleTaskClick = (task: Task) => {
      if (task.type === TaskType.RECURRING) {
          setSelectedRecurringTask(task);
      } else if (onEditTask) {
          onEditTask(task);
      }
  };

  const selectedTasks = tasks.filter(t => isTaskForDate(t, selectedDateStr));
  
  const formattedSelectedDate = new Date(selectedDateStr).toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  const monthsRu = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  return (
    <div className="animate-fade-in pb-20">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 mb-6 transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight flex items-center gap-2">
                Календарь
            </h2>
            <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-1">
                <button onClick={prevMonth} className="p-1.5 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm rounded-md transition-all"><ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" /></button>
                <span className="text-sm font-semibold w-24 text-center text-gray-700 dark:text-gray-200">{monthsRu[month]} {year}</span>
                <button onClick={nextMonth} className="p-1.5 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm rounded-md transition-all"><ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-4 text-center">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
                <div key={d} className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-2 gap-x-1">
            {paddingArray.map(i => <div key={`pad-${i}`} />)}
            {daysArray.map(day => {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isSelected = dateStr === selectedDateStr;
                const isToday = dateStr === new Date().toISOString().split('T')[0];
                const count = getTaskCountForDate(day);

                return (
                    <div key={day} className="flex flex-col items-center">
                        <button
                            onClick={() => handleDayClick(day)}
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all relative
                                ${isSelected ? 'bg-indigo-600 text-white shadow-md scale-110' : 
                                isToday ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 font-bold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}
                            `}
                        >
                            {day}
                            {count > 0 && !isSelected && (
                                <span className="absolute bottom-1 w-1 h-1 bg-indigo-400 rounded-full"></span>
                            )}
                        </button>
                    </div>
                );
            })}
          </div>
      </div>

      <div>
         <div className="flex items-center gap-3 mb-4 px-1">
             <div className="h-4 w-1 bg-indigo-500 rounded-full"></div>
             <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                {formattedSelectedDate}
             </h3>
         </div>
         {selectedTasks.length === 0 ? (
             <div className="text-center py-10 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 transition-colors">
                 <p className="text-gray-400 dark:text-gray-500 text-sm">Нет задач на этот день</p>
             </div>
         ) : (
             selectedTasks.map(task => (
                 <TaskItem 
                    key={task.id} 
                    task={task} 
                    onToggle={onToggle} 
                    onClick={handleTaskClick} 
                    dateContext={selectedDateStr}
                 />
             ))
         )}
      </div>

      {selectedRecurringTask && (
          <RecurringProgressModal 
            task={selectedRecurringTask}
            onClose={() => setSelectedRecurringTask(null)}
          />
      )}
    </div>
  );
};

export default CalendarView;