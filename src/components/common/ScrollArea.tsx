import clsx from 'clsx';
import React, { useEffect, useRef } from 'react';

export interface ScrollAreaProps {
  className?: string;
  hideScrollbarX?: boolean;
  hideScrollbarY?: boolean;
}

export const ScrollArea: React.FC<ScrollAreaProps> = ({
  className,
  children,
  hideScrollbarX,
  hideScrollbarY,
}) => {
  const areaRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const barXRef = useRef<HTMLDivElement>(null);
  const barTrackXRef = useRef<HTMLDivElement>(null);

  const barYRef = useRef<HTMLDivElement>(null);
  const barTrackYRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const area = areaRef.current;
    const content = contentRef.current;
    const barX = barXRef.current;
    const barTrackX = barTrackXRef.current;
    const barY = barYRef.current;
    const barTrackY = barTrackYRef.current;

    if (!area || !content || !barX || !barTrackX || !barY || !barTrackY) {
      return;
    }

    const recalculateBarX = () => {
      const areaRect = area.getBoundingClientRect();
      const width = Math.min(1.0, areaRect.width / content.scrollWidth);

      barX.style.width = width * 100 + '%';
      barX.style.left = (content.scrollLeft / content.scrollWidth) * 100 + '%';

      barTrackX.style.display = hideScrollbarX || width >= 1 ? 'none' : 'block';
    };

    const recalculateBarY = () => {
      const areaRect = area.getBoundingClientRect();
      const height = Math.min(1.0, areaRect.height / content.scrollHeight);

      barY.style.height = height * 100 + '%';
      barY.style.top = (content.scrollTop / content.scrollHeight) * 100 + '%';

      barTrackY.style.display =
        hideScrollbarY || height >= 1 ? 'none' : 'block';
    };

    const onScroll = () => {
      recalculateBarX();
      recalculateBarY();
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
      } else {
        barY.classList.add('scrollarea-bar-active');
      }
    };

    const onMoveDrag = (x: number, y: number) => {
      if (!dragging) return;

      const areaRect = area.getBoundingClientRect();
      if (dragging === 'x') {
        const diff = x - initX;
        content.scrollLeft =
          initScrollLeft + (diff / areaRect.width) * content.scrollWidth;
      } else {
        const diff = y - initY;
        content.scrollTop =
          initScrollTop + (diff / areaRect.height) * content.scrollHeight;
      }
    };

    const onEndDrag = () => {
      dragging = undefined;

      barX.classList.remove('scrollarea-bar-active');
      barY.classList.remove('scrollarea-bar-active');
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

    const onMouseDownY = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      onStartDrag('y', e.clientX, e.clientY);
    };

    const onTouchStartY = (e: TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const touch = e.touches[0];
      if (!touch) {
        return;
      }

      onStartDrag('y', touch.clientX, touch.clientY);
    };

    onScroll();
    content.addEventListener('scroll', onScroll);

    barX.addEventListener('mousedown', onMouseDownX);
    barX.addEventListener('touchstart', onTouchStartX);

    barY.addEventListener('mousedown', onMouseDownY);
    barY.addEventListener('touchstart', onTouchStartY);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', onEndDrag);

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', onEndDrag);
    document.addEventListener('touchcancel', onEndDrag);

    return () => {
      content.removeEventListener('scroll', onScroll);

      barX.removeEventListener('mousedown', onMouseDownX);
      barX.removeEventListener('touchstart', onTouchStartX);

      barY.addEventListener('mousedown', onMouseDownY);
      barY.addEventListener('touchstart', onTouchStartY);

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
      <div className="scrollarea-bar-track-x" ref={barTrackXRef}>
        <div className="scrollarea-bar-x" ref={barXRef}></div>
      </div>
      <div className="scrollarea-bar-track-y" ref={barTrackYRef}>
        <div className="scrollarea-bar-y" ref={barYRef}></div>
      </div>
    </div>
  );
};
