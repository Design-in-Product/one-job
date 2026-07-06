// src/components/LongPressMenu.tsx
// Long-press menu with gentle arc layout above the card deck

import React from 'react';
import { Plus, RotateCcw, Link2, Settings } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const menuItems = [
    {
      icon: Plus,
      label: t('menu.addTask'),
      action: onAddTask,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      icon: RotateCcw,
      label: t('menu.completed'),
      action: onViewCompleted,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      icon: Link2,
      label: t('menu.integrations'),
      action: onViewIntegrations,
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      icon: Settings,
      label: t('menu.settings'),
      action: onSettings || (() => {}),
      color: 'bg-gray-500 hover:bg-gray-600'
    }
  ];

  // Calculate positions for gentle arc (60-90 degrees)
  const getItemPosition = (index: number, total: number) => {
    // 90-degree arc at 150px: adjacent 56px bubbles get ~77px between
    // centers, so buttons and their labels never crowd each other.
    const arcStart = -45; // degrees from center
    const arcEnd = 45;    // degrees from center
    const angle = arcStart + (index * (arcEnd - arcStart)) / (total - 1);
    const radius = 150; // pixels from center
    
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Menu items: each is one positioned unit — bubble with its label
          stacked beneath — so labels can never overlap the bubbles. */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="relative pointer-events-auto">
              {menuItems.map((item, index) => {
                const position = getItemPosition(index, menuItems.length);
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.5, x: 0, y: 0 }}
                    animate={{ opacity: 1, scale: 1, x: position.x, y: position.y }}
                    exit={{ opacity: 0, scale: 0.5, x: 0, y: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 300,
                      damping: 25
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center w-20"
                  >
                    <button
                      onClick={item.action}
                      className={`
                        w-14 h-14 rounded-full shadow-lg
                        ${item.color} text-white
                        flex items-center justify-center
                        hover:scale-110 active:scale-95
                        transition-transform duration-150
                        border-2 border-white
                      `}
                      style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)' }}
                      aria-label={item.label}
                    >
                      <Icon className="w-6 h-6" />
                    </button>
                    <span className="mt-1.5 text-xs font-medium text-white bg-black/75 px-2 py-0.5 rounded whitespace-nowrap">
                      {item.label}
                    </span>
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