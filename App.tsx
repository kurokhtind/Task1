import React, { useState, useEffect } from 'react';
import { Plus, LayoutList, X, Calendar as CalendarIcon, Clock, List, CalendarClock, Moon, Sun, Globe, Flag, Backpack, Repeat } from 'lucide-react';
import { Task, UserStats, Tab, TaskPriority, TaskType, Reward, InventoryItem, BurnedItem } from './types';
import TaskItem from './components/TaskItem';
import StatsView from './components/StatsView';
import CalendarView from './components/CalendarView';
import TimelineView from './components/TimelineView';
import HabitsView from './components/HabitsView';
import TaskDetailModal from './components/TaskDetailModal';
import InventoryModal from './components/InventoryModal';
import DailySummaryModal from './components/DailySummaryModal';

const INITIAL_STATS: UserStats = {
  level: 1,
  currentXP: 0,
  xpToNextLevel: 100,
  totalTasksCompleted: 0,
  streakDays: 1,
  lastActiveDate: new Date().toISOString(),
  coins: 0,
  inventory: [],
  burnedHistory: []
};

const App: React.FC = () => {
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('levelup_theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [activeTab, setActiveTab] = useState<Tab>(Tab.TASKS);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [stats, setStats] = useState<UserStats>(INITIAL_STATS);
  
  // Helper to get local YYYY-MM-DD
  const getLocalTodayStr = () => {
     const d = new Date();
     return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // Shared Date State
  const todayStr = getLocalTodayStr();
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);
  
  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isDailySummaryOpen, setIsDailySummaryOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Form State
  const [newTaskInput, setNewTaskInput] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [newTaskType, setNewTaskType] = useState<TaskType>(TaskType.ONE_TIME);
  const [recurringDays, setRecurringDays] = useState<number[]>([1,2,3,4,5]); 
  
  // New Form States for Logic
  const [isGlobal, setIsGlobal] = useState(false);
  const [useTime, setUseTime] = useState(false);
  const [useDeadline, setUseDeadline] = useState(false);
  const [timeValue, setTimeValue] = useState(''); // HH:MM
  const [deadlineValue, setDeadlineValue] = useState(''); // YYYY-MM-DDTHH:MM

  // Theme Effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('levelup_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('levelup_theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const savedTasks = localStorage.getItem('levelup_tasks');
    const savedStats = localStorage.getItem('levelup_stats');
    const savedRewards = localStorage.getItem('levelup_rewards');
    
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedStats) {
        const parsedStats = JSON.parse(savedStats);
        // Ensure legacy data has new fields
        if (!parsedStats.inventory) parsedStats.inventory = [];
        if (!parsedStats.burnedHistory) parsedStats.burnedHistory = [];
        setStats(parsedStats);
    }
    if (savedRewards) setRewards(JSON.parse(savedRewards));
  }, []);

  useEffect(() => {
    localStorage.setItem('levelup_tasks', JSON.stringify(tasks));
    localStorage.setItem('levelup_stats', JSON.stringify(stats));
    localStorage.setItem('levelup_rewards', JSON.stringify(rewards));
  }, [tasks, stats, rewards]);

  const getXpValue = (priority: TaskPriority) => {
    switch (priority) {
        case TaskPriority.HIGH: return 50;
        case TaskPriority.MEDIUM: return 30;
        case TaskPriority.LOW: return 15;
        default: return 20;
    }
  };

  const getCoinValue = (priority: TaskPriority) => {
    switch (priority) {
        case TaskPriority.LOW: return 1;
        case TaskPriority.MEDIUM: return 2;
        case TaskPriority.HIGH: return 3;
        default: return 1;
    }
  };

  const addTask = (title: string, priority: TaskPriority = TaskPriority.MEDIUM, xp?: number, deadline?: string, type: TaskType = TaskType.ONE_TIME, recDays?: number[]) => {
    const calculatedXP = xp || getXpValue(priority);
    const calculatedCoins = getCoinValue(priority);
    
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      isCompleted: false, 
      priority,
      xpValue: calculatedXP,
      coinReward: calculatedCoins,
      createdAt: Date.now(),
      deadline: deadline || undefined,
      type,
      recurringDays: type === TaskType.RECURRING ? recDays : undefined,
      completedDates: type === TaskType.RECURRING ? [] : undefined,
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const simpleAdd = () => {
    if (newTaskInput.trim()) {
        let finalDeadline: string | undefined = undefined;
        const baseDate = activeTab === Tab.CALENDAR ? selectedDateStr : todayStr;

        if (newTaskType === TaskType.ONE_TIME) {
            if (isGlobal) {
                if (useDeadline && deadlineValue) {
                    finalDeadline = deadlineValue;
                }
            } else {
                if (useDeadline && deadlineValue) {
                    finalDeadline = deadlineValue;
                } else if (useTime && timeValue) {
                    finalDeadline = `${baseDate}T${timeValue}`;
                } else {
                    finalDeadline = baseDate;
                }
            }
        } else {
            if (useTime && timeValue) {
                finalDeadline = timeValue;
            }
        }

        // Validate past dates
        if (newTaskType === TaskType.ONE_TIME && !isGlobal) {
            const dateToCheck = finalDeadline || baseDate;
            const now = new Date();
            if (dateToCheck.includes('T')) {
                if (new Date(dateToCheck) < now) {
                    alert('Нельзя создавать задачи в прошлом!');
                    return;
                }
            } else {
                if (dateToCheck < todayStr) {
                     alert('Нельзя создавать задачи в прошлом!');
                     return;
                }
            }
        } else if (newTaskType === TaskType.ONE_TIME && isGlobal && finalDeadline) {
             const now = new Date();
             if (finalDeadline.includes('T')) {
                if (new Date(finalDeadline) < now) {
                    alert('Нельзя создавать задачи в прошлом!');
                    return;
                }
             } else {
                 if (finalDeadline < todayStr) {
                    alert('Нельзя создавать задачи в прошлом!');
                    return;
                 }
             }
        }

        addTask(newTaskInput, newTaskPriority, undefined, finalDeadline, newTaskType, recurringDays);
        resetModal();
    }
  };

  const handleOpenAddModal = () => {
    setNewTaskType(TaskType.ONE_TIME);
    setIsGlobal(false);
    setUseTime(false);
    setUseDeadline(false);
    setTimeValue('');
    setDeadlineValue('');
    setIsAddModalOpen(true);
  };

  const resetModal = () => {
    setNewTaskInput('');
    setNewTaskPriority(TaskPriority.MEDIUM);
    setNewTaskType(TaskType.ONE_TIME);
    setRecurringDays([1,2,3,4,5]);
    setIsGlobal(false);
    setUseTime(false);
    setUseDeadline(false);
    setTimeValue('');
    setDeadlineValue('');
    setIsAddModalOpen(false);
  };

  const toggleTask = (id: string, dateContext?: string) => {
    const targetDate = dateContext ? dateContext.split('T')[0] : todayStr;

    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        if (t.type === TaskType.RECURRING) {
            const completedDates = t.completedDates || [];
            const isAlreadyDone = completedDates.some(d => d.startsWith(targetDate));
            if (isAlreadyDone) return t;

            const newCompletedDates = [...completedDates, new Date().toISOString()];
            updateStats(t.xpValue, t.coinReward);
            return { ...t, completedDates: newCompletedDates };
        } else {
            if (t.isCompleted) return t; 

            updateStats(t.xpValue, t.coinReward);
            return { ...t, isCompleted: true, completedAt: Date.now() };
        }
      }
      return t;
    }));
  };

  const updateStats = (xpAmount: number, coinAmount: number) => {
    setStats(prev => {
      let newXP = prev.currentXP + xpAmount;
      let newLevel = prev.level;
      let newXPToNext = prev.xpToNextLevel;
      if (newXP >= prev.xpToNextLevel) {
        newXP -= prev.xpToNextLevel;
        newLevel += 1;
        newXPToNext = Math.floor(prev.xpToNextLevel * 1.2); 
      }
      return {
        ...prev,
        currentXP: newXP,
        level: newLevel,
        xpToNextLevel: newXPToNext,
        totalTasksCompleted: prev.totalTasksCompleted + 1,
        coins: (prev.coins || 0) + coinAmount
      };
    });
  };

  // Reward Shop Actions
  const handleCreateReward = (reward: Reward) => {
      setRewards(prev => [...prev, reward]);
  };

  const handleBuyReward = (rewardId: string) => {
      const reward = rewards.find(r => r.id === rewardId);
      if (!reward) return;
      if (stats.coins < reward.cost) {
          alert("Недостаточно монет!");
          return;
      }
      
      const inventoryItem: InventoryItem = {
          ...reward,
          instanceId: crypto.randomUUID(),
          purchasedAt: Date.now()
      };

      setStats(prev => ({
          ...prev,
          coins: prev.coins - reward.cost,
          inventory: [...prev.inventory, inventoryItem]
      }));
  };

  const handleBurnReward = (instanceId: string) => {
      const itemToBurn = stats.inventory.find(i => i.instanceId === instanceId);
      if (!itemToBurn) return;

      const burnedItem: BurnedItem = {
          ...itemToBurn,
          burnedAt: Date.now()
      };

      setStats(prev => ({
          ...prev,
          inventory: prev.inventory.filter(item => item.instanceId !== instanceId),
          burnedHistory: [...(prev.burnedHistory || []), burnedItem]
      }));
  };

  const handleDeleteReward = (rewardId: string) => {
      setRewards(prev => prev.filter(r => r.id !== rewardId));
  };


  const updateTask = (updatedTask: Task) => {
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Handle Data Import
  const handleImportData = (data: any) => {
      try {
          if (data.tasks) setTasks(data.tasks);
          if (data.stats) setStats(data.stats);
          if (data.rewards) setRewards(data.rewards);
          alert('Данные успешно загружены!');
      } catch (e) {
          alert('Ошибка при чтении файла.');
      }
  };

  const todayTasks = tasks.filter(t => {
      if (t.type === TaskType.RECURRING) {
          const dayOfWeek = new Date().getDay();
          const jsDay = dayOfWeek === 0 ? 0 : dayOfWeek; 
          return t.recurringDays?.includes(jsDay);
      } else {
          if (!t.deadline) return false;
          const deadlineDate = t.deadline.split('T')[0];
          if (deadlineDate === todayStr) return true;
          if (deadlineDate < todayStr && !t.isCompleted) return true;
          return false;
      }
  });

  const upcomingTasks = tasks.filter(t => {
    if (t.type === TaskType.ONE_TIME && t.deadline && !t.isCompleted) {
        const dl = t.deadline.split('T')[0];
        return dl > todayStr;
    }
    return false;
  });

  const globalTasks = tasks.filter(t => t.type === TaskType.ONE_TIME && !t.deadline);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 pb-28 font-sans max-w-md mx-auto relative shadow-2xl overflow-hidden transition-colors duration-300">
      
      {/* Header - Fixed Position */}
      <div className="fixed top-0 z-40 w-full max-w-md left-0 right-0 mx-auto bg-white/90 dark:bg-gray-900/90 backdrop-blur-md h-16 flex items-center px-6 shadow-sm border-b border-gray-100 dark:border-gray-800 transition-colors duration-300 justify-between">
         <div className="flex items-center gap-4">
             <div className="flex items-center gap-3">
                 <h1 className="text-2xl font-bold tracking-tight text-gray-800 dark:text-gray-100">
                     {activeTab === Tab.TASKS ? 'Задачи' : 
                      activeTab === Tab.TIMELINE ? 'По часам' :
                      activeTab === Tab.HABITS ? 'Привычки' :
                      activeTab === Tab.CALENDAR ? 'Календарь' : 'Профиль'}
                 </h1>
             </div>
             
             <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
             >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>
         </div>
         
         <div className="flex items-center gap-2">
             <button 
                onClick={() => setIsInventoryOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition border bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 border-amber-100 dark:border-amber-800"
             >
                 <Backpack className="w-4 h-4" />
                 <span className="hidden sm:inline">Инвентарь</span>
             </button>
             
             <button 
                onClick={() => setActiveTab(Tab.PROFILE)} 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition border 
                    ${activeTab === Tab.PROFILE 
                        ? 'bg-indigo-600 text-white border-indigo-600' 
                        : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border-indigo-100 dark:border-indigo-800'}`}
             >
                 Lvl {stats.level}
             </button>
         </div>
      </div>

      {/* Main Content Area - Added top padding to account for fixed header */}
      <div className="p-4 pt-20">
        
        {activeTab === Tab.TASKS && (
          <div className="animate-fade-in space-y-6">
             {/* Today's Plan */}
             <div>
                <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                            Сегодня
                        </h2>
                    </div>
                </div>
                
                {todayTasks.length === 0 ? (
                    <div className="text-center py-6 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 mb-4 transition-colors">
                        <p className="text-gray-400 dark:text-gray-500 text-sm">Все задачи выполнены!</p>
                    </div>
                ) : (
                    <div className="mb-4">
                        {todayTasks.map(task => (
                            <TaskItem 
                                key={task.id} 
                                task={task} 
                                onToggle={toggleTask} 
                                onClick={setSelectedTask}
                                dateContext={todayStr} 
                            />
                        ))}
                    </div>
                )}
             </div>

             {/* Upcoming Tasks */}
             {upcomingTasks.length > 0 && (
                 <div>
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <CalendarClock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                            Предстоящие
                        </h2>
                    </div>
                    {upcomingTasks
                        .sort((a, b) => (a.deadline || '').localeCompare(b.deadline || ''))
                        .map(task => (
                        <TaskItem 
                            key={task.id} 
                            task={task} 
                            onToggle={toggleTask} 
                            onClick={setSelectedTask}
                        />
                    ))}
                 </div>
             )}

             {/* Global / Backlog */}
             <div>
                <div className="flex items-center gap-2 mb-3 px-1">
                    <List className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                        Глобальные
                    </h2>
                </div>
                {globalTasks.length === 0 ? (
                    <div className="text-center py-6 bg-white/40 dark:bg-gray-900/40 rounded-2xl">
                        <p className="text-sm text-gray-400 dark:text-gray-500">Пусто</p>
                    </div>
                ) : (
                    globalTasks.map(task => (
                        <TaskItem 
                            key={task.id} 
                            task={task} 
                            onToggle={toggleTask} 
                            onClick={setSelectedTask}
                        />
                    ))
                )}
             </div>
          </div>
        )}

        {activeTab === Tab.TIMELINE && (
            <TimelineView 
                tasks={tasks}
                onToggle={toggleTask}
                onClick={setSelectedTask}
                selectedDateStr={selectedDateStr}
                onDateSelect={setSelectedDateStr}
            />
        )}

        {activeTab === Tab.HABITS && (
            <HabitsView 
                tasks={tasks}
                onToggle={toggleTask}
                onClick={setSelectedTask}
            />
        )}

        {activeTab === Tab.CALENDAR && (
            <CalendarView 
                tasks={tasks} 
                onToggle={toggleTask} 
                onDelete={deleteTask}
                selectedDateStr={selectedDateStr}
                onDateSelect={setSelectedDateStr}
                onEditTask={setSelectedTask}
            />
        )}

        {activeTab === Tab.PROFILE && (
             <StatsView 
                stats={stats} 
                tasks={tasks} 
                rewards={rewards}
                onCreateReward={handleCreateReward}
                onBuyReward={handleBuyReward}
                onDeleteReward={handleDeleteReward}
                onOpenDailySummary={() => setIsDailySummaryOpen(true)}
                selectedDateStr={selectedDateStr}
                isDarkMode={isDarkMode}
                onImportData={handleImportData}
            />
        )}
      </div>

      {/* Navigation Bar - 5 Tabs Layout - Centered Grid */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 h-20 max-w-md mx-auto z-30 grid grid-cols-5 items-center pb-2 transition-colors duration-300">
            {/* Tab 1: Tasks */}
            <button 
                onClick={() => setActiveTab(Tab.TASKS)}
                className={`flex flex-col items-center justify-center transition-all h-full mx-auto w-14
                ${activeTab === Tab.TASKS ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
            >
                <div className={`p-2 rounded-2xl transition-all ${activeTab === Tab.TASKS ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}>
                    <LayoutList className="w-6 h-6" />
                </div>
            </button>

            {/* Tab 2: Timeline */}
            <button 
                onClick={() => setActiveTab(Tab.TIMELINE)}
                className={`flex flex-col items-center justify-center transition-all h-full mx-auto w-14
                ${activeTab === Tab.TIMELINE ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
            >
                <div className={`p-2 rounded-2xl transition-all ${activeTab === Tab.TIMELINE ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}>
                    <Clock className="w-6 h-6" />
                </div>
            </button>
            
            {/* Tab 3: Add (Action) */}
            <button
                onClick={handleOpenAddModal}
                className="flex flex-col items-center justify-center transition-all h-full mx-auto w-14 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 group"
            >
                <div className="w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-600/30 dark:shadow-indigo-900/20 flex items-center justify-center transition-transform group-active:scale-95">
                    <Plus className="w-6 h-6" />
                </div>
            </button>

             {/* Tab 4: Habits */}
             <button 
                onClick={() => setActiveTab(Tab.HABITS)}
                className={`flex flex-col items-center justify-center transition-all h-full mx-auto w-14
                ${activeTab === Tab.HABITS ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
            >
                <div className={`p-2 rounded-2xl transition-all ${activeTab === Tab.HABITS ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}>
                    <Repeat className="w-6 h-6" />
                </div>
            </button>

            {/* Tab 5: Calendar */}
            <button 
                onClick={() => setActiveTab(Tab.CALENDAR)}
                className={`flex flex-col items-center justify-center transition-all h-full mx-auto w-14
                ${activeTab === Tab.CALENDAR ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
            >
                <div className={`p-2 rounded-2xl transition-all ${activeTab === Tab.CALENDAR ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}>
                     <CalendarIcon className="w-6 h-6" />
                </div>
            </button>
      </div>

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl shadow-2xl animate-fade-in-up overflow-hidden max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-800 transition-colors">
                <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 p-4 flex justify-between items-center sticky top-0 z-10">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Новая задача</h3>
                    <button onClick={resetModal} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><X className="w-6 h-6 text-gray-500 dark:text-gray-400" /></button>
                </div>
                
                <div className="p-5">
                    {/* Task Type Switcher */}
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6 transition-colors">
                        <button 
                            onClick={() => {
                                setNewTaskType(TaskType.ONE_TIME);
                                setIsGlobal(false);
                            }}
                            className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${newTaskType === TaskType.ONE_TIME ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}
                        >
                            Обычная
                        </button>
                        <button 
                            onClick={() => {
                                setNewTaskType(TaskType.RECURRING);
                                setIsGlobal(false);
                            }}
                            className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${newTaskType === TaskType.RECURRING ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}
                        >
                            Регулярная
                        </button>
                    </div>

                    <textarea
                        value={newTaskInput}
                        onChange={(e) => setNewTaskInput(e.target.value)}
                        placeholder="Что нужно сделать?"
                        className="w-full h-24 bg-gray-50 dark:bg-gray-800 rounded-xl border-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 p-4 mb-6 text-gray-800 dark:text-gray-100 resize-none placeholder-gray-400 dark:placeholder-gray-500 text-lg transition-colors"
                    />

                    <div className="mb-6 space-y-4">
                        {/* Toggle Chips */}
                        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                            <button
                                onClick={() => {
                                    setIsGlobal(!isGlobal);
                                    if (!isGlobal) {
                                        setUseTime(false);
                                        setNewTaskType(TaskType.ONE_TIME); // Force one-time if global is selected
                                    }
                                }}
                                disabled={newTaskType === TaskType.RECURRING}
                                className={`px-4 py-2 rounded-full text-xs font-bold uppercase flex items-center gap-2 transition-all whitespace-nowrap
                                ${isGlobal ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}
                                ${newTaskType === TaskType.RECURRING ? 'opacity-30 cursor-not-allowed' : ''}
                                `}
                            >
                                <Globe className="w-4 h-4" />
                                Глобально
                            </button>
                            
                            <button
                                onClick={() => {
                                    if (!isGlobal) {
                                        setUseTime(!useTime);
                                    }
                                }}
                                disabled={isGlobal}
                                className={`px-4 py-2 rounded-full text-xs font-bold uppercase flex items-center gap-2 transition-all whitespace-nowrap
                                ${useTime ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}
                                ${isGlobal ? 'opacity-40 cursor-not-allowed' : ''}`}
                            >
                                <Clock className="w-4 h-4" />
                                Время
                            </button>

                            {newTaskType === TaskType.ONE_TIME && (
                                <button
                                    onClick={() => setUseDeadline(!useDeadline)}
                                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase flex items-center gap-2 transition-all whitespace-nowrap
                                    ${useDeadline ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}
                                    `}
                                >
                                    <Flag className="w-4 h-4" />
                                    Дедлайн
                                </button>
                            )}
                        </div>

                        {/* Conditional Inputs */}
                        {useTime && !isGlobal && (
                            <div className="animate-fade-in flex items-center bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-700">
                                <Clock className="w-5 h-5 text-indigo-500 mr-3" />
                                <input 
                                    type="time"
                                    value={timeValue}
                                    onChange={(e) => setTimeValue(e.target.value)}
                                    className="bg-transparent w-full text-sm outline-none text-gray-700 dark:text-gray-200 font-bold"
                                />
                            </div>
                        )}

                        {useDeadline && newTaskType === TaskType.ONE_TIME && (
                            <div className="animate-fade-in">
                                <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5 block ml-1">Выполнить до</label>
                                <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-700">
                                    <CalendarClock className="w-5 h-5 text-red-500 mr-3" />
                                    <input 
                                        type="datetime-local"
                                        value={deadlineValue}
                                        onChange={(e) => setDeadlineValue(e.target.value)}
                                        className="bg-transparent w-full text-sm outline-none text-gray-700 dark:text-gray-200 font-medium"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {newTaskType === TaskType.RECURRING && (
                        <div className="mb-6">
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
                                            className={`w-10 h-10 rounded-full text-xs font-bold transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                                        >
                                            {day}
                                        </button>
                                    )
                                })}
                             </div>
                        </div>
                    )}

                    <div className="mb-8">
                        <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 block">Сложность (XP + Монеты)</label>
                        <div className="flex gap-3">
                             {[TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH].map((priority) => {
                                 let colorClass = '';
                                 if (priority === TaskPriority.LOW) colorClass = newTaskPriority === priority ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 ring-2 ring-green-500' : 'bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-500/70';
                                 if (priority === TaskPriority.MEDIUM) colorClass = newTaskPriority === priority ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 ring-2 ring-orange-500' : 'bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-500/70';
                                 if (priority === TaskPriority.HIGH) colorClass = newTaskPriority === priority ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 ring-2 ring-red-500' : 'bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-500/70';

                                 return (
                                     <button
                                         key={priority}
                                         onClick={() => setNewTaskPriority(priority)}
                                         className={`flex-1 py-3 text-xs font-bold uppercase rounded-xl transition-all ${colorClass}`}
                                     >
                                         {priority}
                                     </button>
                                 )
                             })}
                        </div>
                        <div className="mt-2 text-center text-xs text-gray-400">
                            {newTaskPriority === TaskPriority.LOW && '1 монета'}
                            {newTaskPriority === TaskPriority.MEDIUM && '2 монеты'}
                            {newTaskPriority === TaskPriority.HIGH && '3 монеты'}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button 
                            onClick={simpleAdd}
                            disabled={!newTaskInput.trim()}
                            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 uppercase text-sm transition-transform active:scale-95"
                        >
                            Добавить
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* View/Edit Task Modal */}
      {selectedTask && (
        <TaskDetailModal 
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onUpdate={updateTask}
            onDelete={deleteTask}
        />
      )}
      
      {/* Inventory Modal */}
      {isInventoryOpen && (
          <InventoryModal 
            items={stats.inventory}
            onClose={() => setIsInventoryOpen(false)}
            onBurn={handleBurnReward}
          />
      )}

      {/* Daily Summary Modal */}
      {isDailySummaryOpen && (
          <DailySummaryModal 
            tasks={tasks}
            onClose={() => setIsDailySummaryOpen(false)}
            stats={stats}
          />
      )}

    </div>
  );
};

export default App;