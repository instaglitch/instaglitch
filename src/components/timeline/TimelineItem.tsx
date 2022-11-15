import React, { useCallback, useContext } from 'react';
import { usePointerDrag } from 'react-use-pointer-drag';

import { TimelineContext } from './TimelineContext';

interface DragState {
  initX: number;
  initMinX: number;
}

export interface TimelineItemProps {
  height: number;
  children?: React.ReactNode;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
  height,
  children,
}) => {
  const { minX, PPS, setMinX } = useContext(TimelineContext);

  const updatePosition = useCallback(
    (x: number, y: number, dragState: DragState) => {
      const deltaX = (x - dragState.initX) / PPS;

      setMinX(Math.max(0, dragState.initMinX - deltaX));
    },
    [setMinX, PPS]
  );

  const { startDragging } = usePointerDrag<DragState>(updatePosition);

  return (
    <>
      <div
        className="timeline-item-wrapper"
        style={{ height: height + 'px' }}
        onMouseDown={(e: React.MouseEvent) => {
          startDragging({
            initX: e.clientX,
            initMinX: minX,
          });
        }}
        onTouchStart={(e: React.TouchEvent) => {
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
