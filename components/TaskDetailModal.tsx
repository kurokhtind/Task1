import React, { useState, useEffect } from 'react';
import { Task, TaskPriority, TaskType } from '../types';
import { X, Clock, Trash2, Save, Calendar, Coins } from 'lucide-react';

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: (updatedTask: Task) => void;
  onDelete: (id: string) => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose, onUpdate, onDelete }) => {
  const [title, setTitle] = useState(task.title);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [xpValue, setXpValue] = useState(task.xpValue);
  
  // Coin reward is derived from priority, read-only
  const getCoinsForPriority = (p: TaskPriority) => {
      switch (p) {
          case TaskPriority.LOW: return 1;
          case TaskPriority.MEDIUM: return 2;
          case TaskPriority.HIGH: return 3;
          default: return 1;
      }
  };

  const [coinReward, setCoinReward] = useState<number>(getCoinsForPriority(task.priority));

  useEffect(() => {
      setCoinReward(getCoinsForPriority(priority));
  }, [priority]);
  
  // Format deadline for datetime-local input
  const getInitialDeadline = () => {
    if (!task.deadline) return '';
    // If it's a date-only string (length 10), append time to make it valid for datetime-local
    if (task.deadline.length === 10) return `${task.deadline}T00:00`;
    return task.deadline;
  };

  const [deadline, setDeadline] = useState(getInitialDeadline());
  // For recurring, if deadline exists it is just "HH:MM".
  const [recurringTime, setRecurringTime] = useState(task.type === TaskType.RECURRING && task.deadline ? task.deadline : '');
  const [recurringDays, setRecurringDays] = useState<number[]>(task.recurringDays || []);

  const handleSave = () => {
    let finalDeadline = undefined;
    
    if (task.type === TaskType.ONE_TIME) {
        finalDeadline = deadline || undefined;
    } else if (task.type === TaskType.RECURRING) {
        finalDeadline = recurringTime || undefined;
    }

    const updatedTask: Task = {
      ...task,
      title,
      priority,
      xpValue,
      coinReward,
      deadline: finalDeadline,
      recurringDays: task.type === TaskType.RECURRING ? recurringDays : undefined
    };
    onUpdate(updatedTask);
    onClose();
  };

  const handleDelete = () => {
    onDelete(task.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 transition-colors">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
           <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Редактирование</span>
           <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
             <X className="w-6 h-6 text-gray-500" />
           </button>
        </div>

        <div className="p-6 space-y-6">
            {/* Title Input */}
            <div>
               <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 block">Задача</label>
               <textarea 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 p-3 text-gray-800 dark:text-gray-100 font-medium resize-none h-20 text-lg"
               />
            </div>

            {/* XP and Priority Row */}
            <div className="flex gap-4">
                <div className="flex-[2]">
                    <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 block">Приоритет</label>
                    <select 
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as TaskPriority)}
                        className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 p-3 text-gray-800 dark:text-gray-100 font-medium appearance-none"
                    >
                        {Object.values(TaskPriority).map(p => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                </div>
                 <div className="flex-1">
                    <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 block">XP</label>
                    <input 
                        type="number" 
                        value={xpValue}
                        onChange={(e) => setXpValue(Number(e.target.value))}
                        className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 p-3 text-gray-800 dark:text-gray-100 font-bold text-center"
                    />
                </div>
            </div>

            {/* Read Only Coin Display */}
            <div className="flex items-center justify-between bg-yellow-50 dark:bg-yellow-900/10 rounded-xl p-3 border border-yellow-100 dark:border-yellow-900/30">
                <span className="text-xs font-bold text-yellow-700 dark:text-yellow-500 uppercase">Награда</span>
                <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-yellow-600 dark:text-yellow-400">{coinReward}</span>
                    <Coins className="w-5 h-5 text-yellow-500" />
                </div>
            </div>

            {/* Date / Recurring Settings */}
            {task.type === TaskType.ONE_TIME ? (
                <div>
                    <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 block">Дедлайн</label>
                    <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3">
                        <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                        <input 
                            type="datetime-local"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            className="bg-transparent w-full text-sm outline-none text-gray-700 dark:text-gray-200 font-medium"
                        />
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                     <div>
                        <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 block">Дни повторения</label>
                        <div className="flex justify-between gap-1">
                            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, index) => {
                                const jsDay = index === 6 ? 0 : index + 1;
                                const isSelected = recurringDays.includes(jsDay);
                                return (
                                    <button
                                        key={day}
                                        onClick={() => {
                                            setRecurringDays(prev => 
                                                prev.includes(jsDay) 
                                                ? prev.filter(d => d !== jsDay)
                                                : [...prev, jsDay]
                                            );
                                        }}
                                        className={`w-9 h-9 rounded-full text-xs font-bold transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}
                                    >
                                        {day}
                                    </button>
                                )
                            })}
                        </div>
                     </div>
                     <div>
                        <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 block">Время (Опционально)</label>
                        <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3">
                            <Clock className="w-5 h-5 text-gray-400 mr-3" />
                            <input 
                                type="time"
                                value={recurringTime}
                                onChange={(e) => setRecurringTime(e.target.value)}
                                className="bg-transparent w-full text-sm outline-none text-gray-700 dark:text-gray-200 font-medium"
                            />
                        </div>
                     </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
                <button 
                    onClick={handleDelete}
                    className="flex-1 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                >
                    <Trash2 className="w-5 h-5" />
                    Удалить
                </button>
                <button 
                    onClick={handleSave}
                    className="flex-[2] py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-transform active:scale-95"
                >
                    <Save className="w-5 h-5" />
                    Сохранить
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;