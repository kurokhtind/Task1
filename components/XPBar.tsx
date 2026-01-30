import React, { useState, useEffect } from 'react';
import { UserStats } from '../types';
import { Trophy, Zap, Clock } from 'lucide-react';

interface XPBarProps {
  stats: UserStats;
  onClick: () => void;
}

const XPBar: React.FC<XPBarProps> = ({ stats, onClick }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const progressPercent = Math.min(100, (stats.currentXP / stats.xpToNextLevel) * 100);

  const formattedDate = currentTime.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' });
  const formattedTime = currentTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

  return (
    <div 
      onClick={onClick}
      className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl shadow-lg p-5 mb-6 text-white cursor-pointer relative overflow-hidden transform transition-transform active:scale-[0.98]"
    >
      {/* Decorative circle */}
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <span className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1 block">
            Уровень
          </span>
          <div className="text-4xl font-black flex items-center gap-2">
            {stats.level}
            <Trophy className="w-6 h-6 text-yellow-300" />
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full mb-1 backdrop-blur-sm">
             <Clock className="w-3 h-3 text-white" />
             <span className="text-xs font-bold uppercase">{formattedTime}</span>
          </div>
          <div className="text-[10px] font-medium text-indigo-200 uppercase tracking-wide">{formattedDate}</div>
        </div>
      </div>

      <div className="flex justify-between text-xs mb-2 relative z-10">
         <span className="text-indigo-200 uppercase font-bold text-[10px]">Прогресс XP</span>
         <span className="font-bold text-white">{stats.currentXP} / {stats.xpToNextLevel}</span>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-2 bg-black/20 rounded-full overflow-hidden mb-4 backdrop-blur-sm">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-300 to-yellow-500 shadow-[0_0_10px_rgba(253,224,71,0.5)] transition-all duration-500 rounded-full"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      <div className="flex justify-between text-xs text-indigo-100 pt-3 border-t border-white/10 relative z-10">
        <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-yellow-300 fill-current" />
            <span className="font-medium">Стрик: <b>{stats.streakDays}</b></span>
        </div>
        <div className="font-medium">
            Квестов: <b>{stats.totalTasksCompleted}</b>
        </div>
      </div>
    </div>
  );
};

export default XPBar;