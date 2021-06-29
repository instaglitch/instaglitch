import React, { useCallback } from 'react';
import { usePointerDrag } from 'react-use-pointer-drag';

interface DragState {
  initX: number;
  initMinX: number;
}

export interface TimelineItemProps {
  pixelsPerSecond: number;
  height: number;
  minX: number;
  maxX: number;
  onUpdate: (minX: number) => void;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
  pixelsPerSecond,
  height,
  minX,
  onUpdate,
  children,
}) => {
  const updatePosition = useCallback(
    (x: number, y: number, dragState: DragState) => {
      const deltaX = (x - dragState.initX) / pixelsPerSecond;

      onUpdate(Math.max(0, dragState.initMinX - deltaX));
    },
    [onUpdate, pixelsPerSecond]
  );

  const { startDragging } = usePointerDrag<DragState>(updatePosition);

  return (
    <>
      <div
        className="timeline-item-wrapper"
        style={{ height: height + 'px' }}
        onMouseDown={(e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();

          startDragging({
            initX: e.clientX,
            initMinX: minX,
          });
        }}
        onTouchStart={(e: React.TouchEvent) => {
          e.preventDefault();
          e.stopPropagation();

          const touch = e.touches[0];
          if (!touch) {
            return;
          }

          startDragging({
            initX: touch.clientX,
            initMinX: minX,
          });
        }}
      >
        {children}
      </div>
    </>
  );
};
