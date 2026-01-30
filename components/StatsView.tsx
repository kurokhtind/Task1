import React, { useMemo, useState, useRef } from 'react';
import { UserStats, Task, Reward } from '../types';
import { 
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { Activity, Flame, CheckCircle, Target, Coins, ShoppingBag, Plus, Trash2, Gift, ClipboardList, Download, Upload, Database } from 'lucide-react';

interface StatsViewProps {
  stats: UserStats;
  tasks: Task[];
  rewards: Reward[];
  onCreateReward: (reward: Reward) => void;
  onBuyReward: (id: string) => void;
  onDeleteReward: (id: string) => void;
  onOpenDailySummary: () => void;
  selectedDateStr: string;
  isDarkMode?: boolean;
  onImportData: (data: any) => void;
}

const StatsView: React.FC<StatsViewProps> = ({ 
    stats, 
    tasks, 
    rewards,
    onCreateReward, 
    onBuyReward, 
    onDeleteReward,
    onOpenDailySummary,
    selectedDateStr, 
    isDarkMode,
    onImportData
}) => {
  
  // New Reward Form State
  const [isCreatingReward, setIsCreatingReward] = useState(false);
  const [newRewardTitle, setNewRewardTitle] = useState('');
  const [newRewardDesc, setNewRewardDesc] = useState('');
  const [newRewardCost, setNewRewardCost] = useState<number>(100);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateSubmit = () => {
      if (!newRewardTitle.trim()) return;
      const reward: Reward = {
          id: crypto.randomUUID(),
          title: newRewardTitle,
          description: newRewardDesc,
          cost: newRewardCost
      };
      onCreateReward(reward);
      setIsCreatingReward(false);
      setNewRewardTitle('');
      setNewRewardDesc('');
      setNewRewardCost(100);
  };

  const handleExport = () => {
      const dataToSave = {
          tasks,
          stats,
          rewards,
          timestamp: Date.now()
      };
      const jsonString = JSON.stringify(dataToSave, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `levelup_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleImportClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const result = e.target?.result;
              if (typeof result === 'string') {
                  const parsed = JSON.parse(result);
                  onImportData(parsed);
              }
          } catch (error) {
              alert('Ошибка формата файла');
          }
      };
      reader.readAsText(file);
      // Reset input value so same file can be selected again
      event.target.value = '';
  };

  // Helper to get local YYYY-MM-DD from timestamp
  const getLocalDateStr = (ts: number) => {
     const d = new Date(ts);
     return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const xpHistoryData = useMemo(() => {
    const days = 7;
    const data = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const localDateKey = getLocalDateStr(date.getTime());
      const displayDate = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
      let dailyXP = 0;

      tasks.forEach(t => {
          if (t.isCompleted && t.completedAt) {
              if (getLocalDateStr(t.completedAt) === localDateKey) {
                  dailyXP += t.xpValue;
              }
          }
      });
      data.push({ name: displayDate, xp: dailyXP });
    }
    return data;
  }, [tasks]);

  return (
    <div className="w-full h-full pb-24 animate-fade-in">
      <div className="p-1 space-y-5">
        
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center transition-colors relative overflow-hidden">
             
             {/* Coin Balance Big Display */}
             <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-full border border-yellow-200 dark:border-yellow-700/50">
                <Coins className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm font-black text-yellow-700 dark:text-yellow-400">{stats.coins}</span>
             </div>

             <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center mb-3 shadow-inner">
                 <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{stats.level}</span>
             </div>
             <h2 className="text-xl font-black text-gray-800 dark:text-gray-100 tracking-tight mb-1">Герой {stats.level} Уровня</h2>
             <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 mb-2 overflow-hidden max-w-[200px]">
                 <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${Math.min(100, (stats.currentXP / stats.xpToNextLevel) * 100)}%` }}></div>
             </div>
             <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">{stats.currentXP} / {stats.xpToNextLevel} XP</p>
        </div>

        {/* Daily Summary Button */}
        <button 
            onClick={onOpenDailySummary}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3 text-white font-bold transform transition-all active:scale-98 hover:shadow-xl hover:shadow-indigo-500/30"
        >
            <ClipboardList className="w-5 h-5" />
            Подвести итог дня
        </button>

        {/* Data Backup */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <Database className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Резервное копирование</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={handleExport}
                    className="flex items-center justify-center gap-2 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold uppercase text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <Download className="w-4 h-4" />
                    Сохранить
                </button>
                <button 
                    onClick={handleImportClick}
                    className="flex items-center justify-center gap-2 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold uppercase text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <Upload className="w-4 h-4" />
                    Загрузить
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept=".json" 
                    className="hidden" 
                />
            </div>
        </div>

        {/* Rewards Shop Section */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
           <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                        <ShoppingBag className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Магазин вознаграждений</h3>
               </div>
               <button 
                  onClick={() => setIsCreatingReward(!isCreatingReward)}
                  className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
               >
                   <Plus className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${isCreatingReward ? 'rotate-45' : ''}`} />
               </button>
           </div>

           {/* Reward Creation Form */}
           {isCreatingReward && (
               <div className="mb-6 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 animate-fade-in">
                   <h4 className="text-xs font-bold text-gray-500 mb-3 uppercase">Создать награду</h4>
                   <div className="space-y-3">
                       <input 
                          type="text" 
                          placeholder="Название (например, Кино)" 
                          value={newRewardTitle}
                          onChange={(e) => setNewRewardTitle(e.target.value)}
                          className="w-full p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm"
                       />
                       <input 
                          type="text" 
                          placeholder="Описание" 
                          value={newRewardDesc}
                          onChange={(e) => setNewRewardDesc(e.target.value)}
                          className="w-full p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm"
                       />
                       <div className="flex gap-2">
                           <div className="flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 w-1/2">
                               <Coins className="w-4 h-4 text-yellow-500 mr-2" />
                               <input 
                                  type="number" 
                                  value={newRewardCost}
                                  onChange={(e) => setNewRewardCost(Number(e.target.value))}
                                  className="w-full py-2 bg-transparent text-sm font-bold outline-none"
                               />
                           </div>
                           <button 
                              onClick={handleCreateSubmit}
                              disabled={!newRewardTitle.trim()}
                              className="w-1/2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50"
                           >
                               Создать
                           </button>
                       </div>
                   </div>
               </div>
           )}

           {/* Rewards List */}
           <div className="space-y-3">
               {rewards.length === 0 ? (
                   <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                       Магазин пуст. Создайте награду для себя!
                   </div>
               ) : (
                   rewards.map(reward => {
                       const canAfford = stats.coins >= reward.cost;
                       return (
                           <div key={reward.id} className="flex flex-col p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 relative group">
                               <div className="flex justify-between items-start mb-2">
                                   <div className="flex items-center gap-3">
                                       <div className="p-2 bg-white dark:bg-gray-700 rounded-full shadow-sm">
                                           <Gift className="w-5 h-5 text-pink-500" />
                                       </div>
                                       <div>
                                           <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">{reward.title}</h4>
                                           <p className="text-xs text-gray-500 dark:text-gray-400">{reward.description}</p>
                                       </div>
                                   </div>
                                   <button 
                                      onClick={() => onDeleteReward(reward.id)}
                                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                   >
                                       <Trash2 className="w-4 h-4" />
                                   </button>
                               </div>
                               
                               <div className="flex items-center justify-between mt-2">
                                   <div className="flex items-center gap-1 font-bold text-yellow-600 dark:text-yellow-500">
                                       <Coins className="w-4 h-4" />
                                       <span>{reward.cost}</span>
                                   </div>
                                   <button 
                                      onClick={() => onBuyReward(reward.id)}
                                      disabled={!canAfford}
                                      className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all
                                        ${canAfford 
                                            ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700 active:scale-95' 
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'}`}
                                   >
                                       Купить
                                   </button>
                               </div>
                           </div>
                       )
                   })
               )}
           </div>
        </div>

        {/* Activity Trend */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Динамика XP</h3>
          </div>
          <div className="h-48 w-full -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={xpHistoryData}>
                <defs>
                  <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1f2937' : '#F3F4F6'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: isDarkMode ? '#6b7280' : '#9CA3AF'}} dy={10} />
                <Tooltip 
                    contentStyle={{
                        borderRadius: '12px', 
                        border: isDarkMode ? '1px solid #374151' : 'none', 
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        backgroundColor: isDarkMode ? '#111827' : '#fff',
                        color: isDarkMode ? '#fff' : '#000'
                    }} 
                />
                <Area type="monotone" dataKey="xp" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorXp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StatsView;