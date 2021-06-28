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

    let dragging: 'x' | 'y' | undefined = undefined;
    let initX = 0;
    let initY = 0;
    let initScrollTop = 0;
    let initScrollLeft = 0;

    const onStartDrag = (bar: 'x' | 'y' | undefined, x: number, y: number) => {
      dragging = bar;
      initX = x;
      initY = y;
      initScrollTop = content.scrollTop;
      initScrollLeft = content.scrollLeft;

      if (bar === 'x') {
        barX.classList.add('scrollarea-bar-active');
      }
    };

    const onMoveDrag = (x: number, y: number) => {
      if (!dragging) return;

      if (dragging === 'x') {
        const areaRect = area.getBoundingClientRect();
        const diff = y - initY;
        content.scrollTop =
          initScrollTop + (diff / areaRect.height) * content.scrollHeight;
      }
    };

    const onEndDrag = () => {
      dragging = undefined;

      barX.classList.remove('scrollarea-bar-active');
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging) return;

      e.preventDefault();
      e.stopPropagation();

      onMoveDrag(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!dragging) return;

      e.preventDefault();
      e.stopPropagation();

      const touch = e.touches[0];
      if (!touch) {
        return;
      }

      onMoveDrag(touch.clientX, touch.clientY);
    };

    const onMouseDownX = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      onStartDrag('x', e.clientX, e.clientY);
    };

    const onTouchStartX = (e: TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const touch = e.touches[0];
      if (!touch) {
        return;
      }

      onStartDrag('x', touch.clientX, touch.clientY);
    };

    onScroll();
    content.addEventListener('scroll', onScroll);

    barX.addEventListener('mousedown', onMouseDownX);
    barX.addEventListener('touchstart', onTouchStartX);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', onEndDrag);

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', onEndDrag);
    document.addEventListener('touchcancel', onEndDrag);

    return () => {
      content.removeEventListener('scroll', onScroll);

      barX.removeEventListener('mousedown', onMouseDownX);
      barX.removeEventListener('touchstart', onTouchStartX);

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', onEndDrag);

      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', onEndDrag);
      document.removeEventListener('touchcancel', onEndDrag);
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
