// src/components/LongPressMenu.tsx
// Long-press menu with gentle arc layout above the card deck

import React from 'react';
import { Plus, RotateCcw, Link2, Settings } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface LongPressMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: () => void;
  onViewCompleted: () => void;
  onViewIntegrations: () => void;
  onSettings?: () => void;
}

const LongPressMenu: React.FC<LongPressMenuProps> = ({
  isOpen,
  onClose,
  onAddTask,
  onViewCompleted,
  onViewIntegrations,
  onSettings
}) => {
  const menuItems = [
    {
      icon: Plus,
      label: 'Add Task',
      action: onAddTask,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      icon: RotateCcw,
      label: 'Completed',
      action: onViewCompleted,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      icon: Link2,
      label: 'Integrations',
      action: onViewIntegrations,
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      icon: Settings,
      label: 'Settings',
      action: onSettings || (() => {}),
      color: 'bg-gray-500 hover:bg-gray-600'
    }
  ];

  // Calculate positions for gentle arc (60-90 degrees)
  const getItemPosition = (index: number, total: number) => {
    const arcStart = -30; // degrees from center
    const arcEnd = 30;    // degrees from center
    const angle = arcStart + (index * (arcEnd - arcStart)) / (total - 1);
    const radius = 120; // pixels from center
    
    // Convert to cartesian coordinates (y negative because CSS y increases downward)
    const x = Math.sin((angle * Math.PI) / 180) * radius;
    const y = -Math.cos((angle * Math.PI) / 180) * radius;
    
    return { x, y };
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-20 z-40"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Menu Items */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="relative pointer-events-auto">
              {menuItems.map((item, index) => {
                const position = getItemPosition(index, menuItems.length);
                const Icon = item.icon;
                
                return (
                  <motion.button
                    key={item.label}
                    initial={{ 
                      opacity: 0, 
                      scale: 0.5,
                      x: 0,
                      y: 0
                    }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      x: position.x,
                      y: position.y
                    }}
                    exit={{ 
                      opacity: 0, 
                      scale: 0.5,
                      x: 0,
                      y: 0
                    }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 300,
                      damping: 25
                    }}
                    onClick={item.action}
                    className={`
                      absolute w-14 h-14 rounded-full shadow-lg
                      ${item.color} text-white
                      flex items-center justify-center
                      transform -translate-x-1/2 -translate-y-1/2
                      hover:scale-110 active:scale-95
                      transition-transform duration-150
                      border-2 border-white
                    `}
                    style={{
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }}
                    aria-label={item.label}
                  >
                    <Icon className="w-6 h-6" />
                  </motion.button>
                );
              })}
              
              {/* Center point indicator (optional, for development) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="absolute w-2 h-2 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-50" />
              )}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Labels (appear on hover/touch) */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-45 pointer-events-none">
            <div className="relative">
              {menuItems.map((item, index) => {
                const position = getItemPosition(index, menuItems.length);
                
                return (
                  <motion.div
                    key={`label-${item.label}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 0.2,
                      delay: index * 0.05 + 0.2
                    }}
                    className="absolute text-xs text-white bg-black bg-opacity-75 px-2 py-1 rounded whitespace-nowrap transform -translate-x-1/2"
                    style={{
                      left: position.x,
                      top: position.y + 40, // Below the button
                      transform: 'translateX(-50%)'
                    }}
                  >
                    {item.label}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LongPressMenu;