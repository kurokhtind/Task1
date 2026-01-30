import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Task, TaskType } from '../types';
import { X, Calendar, CheckCircle, XCircle, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface RecurringProgressModalProps {
  task: Task;
  onClose: () => void;
}

const RecurringProgressModal: React.FC<RecurringProgressModalProps> = ({ task, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  if (task.type !== TaskType.RECURRING) return null;

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

  const monthsRu = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  // Calculate Total Stats
  const stats = useMemo(() => {
     const totalCompleted = task.completedDates?.length || 0;
     return { totalCompleted };
  }, [task.completedDates]);

  // Calculate Last 7 Days Data for Chart
  const chartData = useMemo(() => {
      const data = [];
      const today = new Date();
      // Loop for last 7 days (6 days ago + today)
      for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          
          const isoDate = d.toISOString().split('T')[0];
          const dayOfWeek = d.getDay(); // 0-6 (Sun-Sat)

          const isScheduled = task.recurringDays?.includes(dayOfWeek);
          const isCompleted = task.completedDates?.some(date => date.startsWith(isoDate));
          
          // Determine bar value and color type
          let value = 0;
          let status = 'none'; // none, completed, missed

          if (isScheduled) {
              value = 1;
              if (isCompleted) {
                  status = 'completed';
              } else if (isoDate <= today.toISOString().split('T')[0]) {
                  status = 'missed';
              }
          }

          data.push({
              name: d.toLocaleDateString('ru-RU', { weekday: 'short' }),
              date: d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
              value,
              status
          });
      }
      return data;
  }, [task]);

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in overflow-hidden">
      <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl shadow-2xl flex flex-col max-h-[90vh] border border-gray-100 dark:border-gray-800 transition-colors relative">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-t-3xl z-10">
           <div className="flex items-center gap-2">
               <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
               <span className="text-sm font-bold uppercase tracking-widest text-gray-700 dark:text-gray-200">Прогресс привычки</span>
           </div>
           <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
             <X className="w-6 h-6 text-gray-500" />
           </button>
        </div>

        <div className="p-5 overflow-y-auto overflow-x-hidden flex-1 scrollbar-hide">
            <h2 className="text-xl font-black text-gray-800 dark:text-gray-100 mb-2 leading-tight">{task.title}</h2>
            
            <div className="flex items-center gap-2 mb-6 text-sm text-gray-500 dark:text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Выполнено раз: <b className="text-gray-800 dark:text-gray-200">{stats.totalCompleted}</b></span>
            </div>

            {/* 7 Day Chart */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 mb-4 shadow-sm">
                 <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Последние 7 дней</h3>
                </div>
                <div className="h-32 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fontSize: 10, fill: '#9ca3af'}} 
                                dy={5}
                            />
                            <Tooltip 
                                cursor={{fill: 'transparent'}}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className="bg-white dark:bg-gray-800 p-2 border border-gray-100 dark:border-gray-700 shadow-lg rounded-lg text-xs z-50">
                                            <p className="font-bold mb-1 dark:text-gray-200">{data.date}</p>
                                            <p className={`
                                                ${data.status === 'completed' ? 'text-green-600 dark:text-green-400' : 
                                                  data.status === 'missed' ? 'text-red-500 dark:text-red-400' : 'text-gray-400'}
                                            `}>
                                                {data.status === 'completed' ? 'Выполнено' : 
                                                 data.status === 'missed' ? 'Пропущено' : 'Выходной'}
                                            </p>
                                        </div>
                                    );
                                    }
                                    return null;
                                }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 4, 4]} barSize={24}>
                                {chartData.map((entry, index) => {
                                    let color = 'transparent'; 
                                    if (entry.status === 'completed') color = '#22c55e';
                                    else if (entry.status === 'missed') color = '#ef4444'; 
                                    
                                    return (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={color} 
                                            opacity={entry.status === 'missed' ? 0.3 : 1}
                                        />
                                    );
                                })}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={prevMonth} className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded-md"><ChevronLeft className="w-5 h-5" /></button>
                    <span className="font-bold text-gray-700 dark:text-gray-200">{monthsRu[month]} {year}</span>
                    <button onClick={nextMonth} className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded-md"><ChevronRight className="w-5 h-5" /></button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
                        <div key={d} className="text-[10px] font-bold text-gray-400 uppercase">{d}</div>
                    ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                    {paddingArray.map(i => <div key={`pad-${i}`} />)}
                    {daysArray.map(day => {
                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const dateObj = new Date(dateStr);
                        const jsDay = dateObj.getDay(); 
                        
                        const isScheduled = task.recurringDays?.includes(jsDay);
                        const isCompleted = task.completedDates?.some(d => d.startsWith(dateStr));
                        const isPast = dateStr < new Date().toISOString().split('T')[0];

                        let bgClass = 'bg-gray-100 dark:bg-gray-700/50 text-gray-400';
                        if (isScheduled) {
                            if (isCompleted) {
                                bgClass = 'bg-green-500 text-white shadow-sm';
                            } else if (isPast) {
                                bgClass = 'bg-red-100 dark:bg-red-900/30 text-red-500 border border-red-200 dark:border-red-800';
                            } else {
                                bgClass = 'bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-400';
                            }
                        }

                        return (
                            <div key={day} className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold ${bgClass}`}>
                                {isCompleted ? <CheckCircle className="w-3.5 h-3.5" /> : 
                                 (isScheduled && isPast) ? <XCircle className="w-3.5 h-3.5" /> : day}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default RecurringProgressModal;