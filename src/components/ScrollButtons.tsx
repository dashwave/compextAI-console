import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface ScrollButtonsProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

export function ScrollButtons({ containerRef }: ScrollButtonsProps) {
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const hasOverflow = container.scrollHeight > container.clientHeight;
      setShowButtons(hasOverflow);
    };

    handleScroll();
    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [containerRef]);

  const scrollTo = (position: 'top' | 'bottom') => {
    if (!containerRef.current) return;
    
    containerRef.current.scrollTo({
      top: position === 'top' ? 0 : containerRef.current.scrollHeight,
      behavior: 'smooth'
    });
  };

  if (!showButtons) return null;

  return (
    <div className="fixed right-8 bottom-8 flex flex-col gap-2">
      <button
        onClick={() => scrollTo('top')}
        className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
        title="Scroll to top"
      >
        <ArrowUp size={20} />
      </button>
      <button
        onClick={() => scrollTo('bottom')}
        className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
        title="Scroll to bottom"
      >
        <ArrowDown size={20} />
      </button>
    </div>
  );
}