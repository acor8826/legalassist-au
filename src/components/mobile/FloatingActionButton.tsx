import React, { useEffect } from 'react';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
  ariaLabel?: string;
}

export default function FloatingActionButton({
  onClick,
  ariaLabel = 'Create new'
}: FloatingActionButtonProps) {
  useEffect(() => {
    console.log('[FloatingActionButton] Component mounted');
    console.log('[FloatingActionButton] Window width:', window.innerWidth);
    console.log('[FloatingActionButton] Should be visible:', window.innerWidth < 768);
  }, []);

  const handleClick = () => {
    console.log('[FloatingActionButton] Button clicked');
    // Trigger haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(15);
      console.log('[FloatingActionButton] Haptic feedback triggered');
    }
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className="
        md:hidden fixed bottom-20 right-4 z-40
        w-14 h-14
        bg-blue-600 hover:bg-blue-700 active:bg-blue-800
        rounded-full
        shadow-lg hover:shadow-xl
        transition-all duration-200
        flex items-center justify-center
        focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2
        transform hover:scale-105 active:scale-95
      "
      aria-label={ariaLabel}
    >
      <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
    </button>
  );
}