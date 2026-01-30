import React from 'react';
import { Achievement } from '../types';
import { Sparkles, X } from 'lucide-react';

interface AchievementModalProps {
  achievement: Achievement;
  onClose: () => void;
}

const AchievementModal: React.FC<AchievementModalProps> = ({ achievement, onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden transform animate-scale-up transition-colors">
        
        {/* Confetti / Ray Effect Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className={`absolute -top-24 -left-24 w-64 h-64 bg-gradient-to-br ${achievement.color} opacity-20 blur-3xl rounded-full`}></div>
           <div className={`absolute -bottom-24 -right-24 w-64 h-64 bg-gradient-to-tl ${achievement.color} opacity-20 blur-3xl rounded-full`}></div>
        </div>

        <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-20"
        >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>

        <div className="flex flex-col items-center text-center p-8 pt-12 relative z-10">
            
            <div className="mb-2 text-sm font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                Новое достижение!
            </div>

            {/* Icon Circle */}
            <div className="relative mb-6">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br ${achievement.color} animate-shine`}>
                    <achievement.icon className="w-12 h-12 text-white animate-pulse" />
                </div>
                {/* Glow ring */}
                <div className={`absolute -inset-2 rounded-full border-2 border-dashed opacity-30 animate-[spin_10s_linear_infinite] border-current text-indigo-500`}></div>
                <div className="absolute -top-6 -right-6">
                    <Sparkles className="w-8 h-8 text-yellow-400 animate-bounce" />
                </div>
            </div>

            <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 mb-2 leading-tight">
                {achievement.title}
            </h2>
            
            <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-8">
                {achievement.description}
            </p>

            <button 
                onClick={onClose}
                className={`w-full py-3.5 rounded-xl text-white font-bold uppercase tracking-wide shadow-lg transform transition-transform active:scale-95 hover:shadow-xl bg-gradient-to-r ${achievement.color}`}
            >
                Супер!
            </button>
        </div>
      </div>
    </div>
  );
};

export default AchievementModal;