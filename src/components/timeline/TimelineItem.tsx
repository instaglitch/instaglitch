import React, { useContext } from 'react';
import { usePointerDrag } from 'react-use-pointer-drag';

import { TimelineContext } from './TimelineContext';

interface DragState {
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

  const { dragProps } = usePointerDrag<DragState>({
    onMove: ({ deltaX, state }) => {
      setMinX(Math.max(0, state.initMinX - deltaX / PPS));
    },
  });

  return (
    <>
      <div
        className="timeline-item-wrapper"
        style={{ height: height + 'px' }}
        {...dragProps({ initMinX: minX })}
      >
        {children}
      </div>
    </>
  );
};
