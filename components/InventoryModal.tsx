import React from 'react';
import { InventoryItem } from '../types';
import { X, Flame, PackageOpen } from 'lucide-react';

interface InventoryModalProps {
  items: InventoryItem[];
  onClose: () => void;
  onBurn: (instanceId: string) => void;
}

const InventoryModal: React.FC<InventoryModalProps> = ({ items, onClose, onBurn }) => {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 transition-colors flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
           <div className="flex items-center gap-2">
               <PackageOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
               <span className="text-sm font-bold uppercase tracking-widest text-gray-700 dark:text-gray-200">Инвентарь</span>
           </div>
           <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
             <X className="w-6 h-6 text-gray-500" />
           </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center opacity-50">
                    <PackageOpen className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Ваш инвентарь пуст</p>
                    <p className="text-xs text-gray-400 mt-1">Покупайте награды в магазине</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map((item) => (
                        <div key={item.instanceId} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-3 animate-fade-in-up">
                            <div>
                                <h4 className="font-bold text-gray-800 dark:text-gray-100">{item.title}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
                            </div>
                            
                            <button 
                                onClick={() => onBurn(item.instanceId)}
                                className="w-full py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold rounded-lg text-xs uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors active:scale-95"
                            >
                                <Flame className="w-4 h-4" />
                                Сжечь (Использовать)
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 text-center border-t border-gray-100 dark:border-gray-800">
             <p className="text-[10px] text-gray-400 uppercase font-bold">Предметов: {items.length}</p>
        </div>
      </div>
    </div>
  );
};

export default InventoryModal;