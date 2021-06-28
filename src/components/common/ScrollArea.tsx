import clsx from 'clsx';
import React, { useEffect, useRef } from 'react';

export interface ScrollAreaProps {
  className?: string;
}

export const ScrollArea: React.FC<ScrollAreaProps> = ({
  className,
  children,
}) => {
  const areaRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const barXRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const area = areaRef.current;
    const content = contentRef.current;
    const barX = barXRef.current;

    if (!area || !content || !barX) {
      return;
    }

    const recalculateBarX = () => {
      const areaRect = area.getBoundingClientRect();
      const height = Math.min(1.0, areaRect.height / content.scrollHeight);
      const scrollTop = content.scrollTop;

      barX.style.height = height * 100 + '%';
      barX.style.top = (scrollTop / content.scrollHeight) * 100 + '%';
    };

    const onScroll = () => {
      recalculateBarX();
    };

    onScroll();
    content.addEventListener('scroll', onScroll);

    return () => {
      content.removeEventListener('scroll', onScroll);
    };
  });

  return (
    <div className={clsx('scrollarea', className)} ref={areaRef}>
      <div className="scrollarea-content" ref={contentRef}>
        {children}
      </div>
      <div className="scrollarea-bar-track-x">
        <div className="scrollarea-bar-x" ref={barXRef}></div>
      </div>
    </div>
  );
};
