import { useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';

interface SwipeableModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  showHandle?: boolean;
}

export function SwipeableModal({
  isOpen,
  onClose,
  children,
  className = '',
  showHandle = true,
}: SwipeableModalProps) {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDrag = useCallback((_: any, info: PanInfo) => {
    if (info.delta.y > 0) {
      setDragY(info.offset.y);
    }
  }, []);

  const handleDragEnd = useCallback(
    (_: any, info: PanInfo) => {
      setIsDragging(false);

      const velocity = info.velocity.y;
      const offset = info.offset.y;

      if (velocity > 500 || offset > 150) {
        onClose();
      } else {
        setDragY(0);
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) {
      setDragY(0);
      setIsDragging(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const opacity = Math.max(0, 1 - dragY / 300);
  const scale = Math.max(0.95, 1 - dragY / 1000);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/40">
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, y: '100%' }}
            animate={{
              opacity: isDragging ? opacity : 1,
              y: isDragging ? dragY : 0,
              scale: isDragging ? scale : 1,
            }}
            exit={{ opacity: 0, y: '100%' }}
            transition={
              isDragging
                ? { duration: 0 }
                : { type: 'spring', damping: 30, stiffness: 350 }
            }
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            className={`w-full sm:max-w-md bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl shadow-stone-900/25 overflow-hidden pb-safe touch-pan-x ${className}`}
            style={{ touchAction: 'pan-x' }}
          >
            {showHandle && (
              <div className="flex justify-center py-3 sm:hidden">
                <div className="w-12 h-1.5 bg-stone-300 rounded-full" />
              </div>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
