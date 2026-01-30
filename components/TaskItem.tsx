import React, { useState } from 'react';
import { Task, TaskPriority, TaskType } from '../types';
import { Check, CalendarClock, Repeat, Clock, Coins } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string, dateContext?: string) => void;
  onClick: (task: Task) => void;
  dateContext?: string;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onClick, dateContext }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // Helper to get local YYYY-MM-DD
  const getLocalTodayStr = () => {
     const d = new Date();
     return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const todayStr = getLocalTodayStr();

  let isCompleted = false;
  if (task.type === TaskType.RECURRING) {
     if (dateContext && task.completedDates) {
        const targetDate = dateContext.split('T')[0]; 
        isCompleted = task.completedDates.some(d => d.startsWith(targetDate));
     }
  } else {
     isCompleted = task.isCompleted;
  }

  const isOverdue = !isCompleted && 
                    task.type === TaskType.ONE_TIME && 
                    task.deadline && 
                    (task.deadline.includes('T') 
                      ? new Date(task.deadline) < new Date() 
                      : task.deadline < todayStr
                    ) &&
                    (!dateContext || dateContext.startsWith(todayStr)); 

  // Logic for Red Background on Recurring Tasks
  // Condition: Recurring AND Unchecked AND (DateContext is Today OR Past)
  const isRecurringAlert = task.type === TaskType.RECURRING && 
                           !isCompleted && 
                           (dateContext ? dateContext <= todayStr : true); // Default to true if listed in general lists (implies active backlog or today)

  const formatDateTime = (dateString: string) => {
    // If it's just a time string HH:MM
    if (dateString.length === 5 && dateString.includes(':')) {
        return dateString;
    }

    const date = new Date(dateString);
    const dayStr = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    if (dateString.includes('T')) {
        const timeStr = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        return `${dayStr}, ${timeStr}`;
    }
    return dayStr;
  };

  const getRecurringText = () => {
    if (!task.recurringDays || task.recurringDays.length === 7) return 'Ежедневно';
    const daysMap = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    return task.recurringDays.map(d => daysMap[d]).join(', ');
  };

  const getPriorityColor = () => {
     switch(task.priority) {
         case TaskPriority.HIGH: return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
         case TaskPriority.MEDIUM: return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400';
         case TaskPriority.LOW: return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
         default: return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300';
     }
  }

  const handleToggle = (e: React.MouseEvent) => {
      e.stopPropagation();
      // Prevent unchecking if already completed
      if (isCompleted) return;
      
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
      onToggle(task.id, dateContext);
  };

  // Dynamic Styles based on state
  let containerClasses = "group relative flex items-center p-4 mb-3 rounded-2xl shadow-sm border transition-all duration-300 ease-in-out cursor-pointer active:scale-[0.99] ";
  
  if (isCompleted) {
      containerClasses += "bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800";
  } else if (isRecurringAlert) {
      // RED ALERT STYLE
      containerClasses += "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50 hover:shadow-md hover:border-red-300";
  } else {
      containerClasses += "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900";
  }

  return (
    <div 
      onClick={() => onClick(task)}
      className={containerClasses}
    >
      {/* Round Checkbox with Animations */}
      <button
        onClick={handleToggle}
        disabled={isCompleted}
        className={`flex-shrink-0 w-7 h-7 mr-4 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative
        ${isAnimating ? 'animate-scale-up' : ''}
        ${isCompleted 
            ? 'bg-gray-300 dark:bg-gray-700 border-gray-300 dark:border-gray-700 cursor-default' 
            : isRecurringAlert
                ? 'border-red-400 dark:border-red-500 bg-white dark:bg-transparent hover:bg-red-100 dark:hover:bg-red-900/30'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-transparent hover:border-indigo-400 dark:hover:border-indigo-400'}`}
      >
        <span className={`transform transition-all duration-300 ${isCompleted ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
             <Check className="w-4 h-4 text-white stroke-[3]" />
        </span>
      </button>

      <div className={`flex-grow min-w-0 transition-opacity duration-300 ${isCompleted ? 'opacity-50' : ''}`}>
         <div className={`text-[16px] font-medium leading-snug mb-1.5 ${
             isCompleted ? 'line-through text-gray-400 dark:text-gray-500' : 
             isRecurringAlert ? 'text-red-900 dark:text-red-100' : 'text-gray-800 dark:text-gray-100'
         }`}>
            {task.title}
         </div>
         
         <div className="flex items-center gap-2 flex-wrap">
            {/* Priority Chip */}
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${getPriorityColor()}`}>
                {task.priority}
            </span>
            
            {/* Meta info */}
            {task.type === TaskType.RECURRING ? (
                <>
                    <span className={`text-xs flex items-center gap-1 font-medium ml-1 ${isRecurringAlert ? 'text-red-400' : 'text-gray-400 dark:text-gray-500'}`}>
                        <Repeat className="w-3 h-3" />
                        {getRecurringText()}
                    </span>
                    {task.deadline && (
                         <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 font-medium ml-1">
                            <Clock className="w-3 h-3" />
                            {task.deadline}
                         </span>
                    )}
                </>
            ) : (
                task.deadline && (
                    <span className={`text-xs flex items-center gap-1 ml-1 ${
                    isOverdue ? 'text-red-500 dark:text-red-400 font-bold' : 'text-gray-400 dark:text-gray-500'
                    }`}>
                    <CalendarClock className="w-3 h-3" />
                    {isOverdue ? '!' : ''} {formatDateTime(task.deadline)}
                    </span>
                )
            )}
         </div>
      </div>

      {/* Right side: XP and Coins */}
      <div className={`ml-4 flex flex-col items-end justify-center transition-all duration-300 gap-1 ${isCompleted ? 'opacity-40 grayscale' : ''}`}>
        
        {/* Coins Reward */}
        <div className={`flex items-center gap-1 ${isRecurringAlert ? 'text-red-500 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
            <span className="text-sm font-black leading-none">+{task.coinReward || 0}</span>
            <Coins className="w-3 h-3" />
        </div>

        {/* XP Reward */}
        <div className="flex flex-col items-end">
             <span className={`text-xs font-black leading-none ${isRecurringAlert ? 'text-red-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                +{task.xpValue} XP
            </span>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;