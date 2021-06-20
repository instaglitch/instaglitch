import React, { useCallback, useMemo } from 'react';
import { usePointerDrag } from 'react-use-pointer-drag';

import { AutomationClip } from './types';
import { fnToChart } from './Utils';

interface DragState {
  moving: 'start' | 'block' | 'end';
  initX: number;
  clip: AutomationClip;
  i: number;
}

export interface ClipEditorProps {
  pixelsPerSecond: number;
  height: number;
  minX: number;
  maxX: number;
  clips: AutomationClip[];
  onChange: (clips: AutomationClip[]) => void;
}

export const ClipEditor: React.FC<ClipEditorProps> = ({
  pixelsPerSecond,
  height,
  minX,
  maxX,
  clips,
  onChange,
}) => {
  const width = useMemo(
    () => (maxX - minX) * pixelsPerSecond,
    [pixelsPerSecond, minX, maxX]
  );

  const updatePosition = useCallback(
    (x: number, y: number, dragState: DragState) => {
      const delta = (x - dragState.initX) / pixelsPerSecond;
      const i = dragState.i;

      let newStart = dragState.clip.start;
      let newEnd = dragState.clip.end;

      if (dragState.moving !== 'start') {
        newEnd += delta;
      }
      if (dragState.moving !== 'end') {
        newStart += delta;
      }

      if (i > 0) {
        if (newStart < clips[i - 1].start) {
          newStart = clips[i - 1].start;
        }
      }

      if (newStart > newEnd - 1) {
        newStart = newEnd - 1;
      }

      if (newEnd < newStart + 1) {
        newEnd = newStart + 1;
      }

      if (typeof clips[i + 1] !== 'undefined') {
        if (newEnd > clips[i + 1].start) {
          newEnd = clips[i + 1].start;
        }
      }

      const newClip: AutomationClip = {
        ...dragState.clip,
      };
      if (dragState.moving !== 'start') {
        newClip.end = newEnd;
      }
      if (dragState.moving !== 'end') {
        newClip.start = newStart;
      }

      clips[i] = newClip;

      onChange(clips);
    },
    [onChange, clips, pixelsPerSecond]
  );

  const { startDragging } = usePointerDrag<DragState>(updatePosition);

  return (
    <div className="timeline-item-wrapper" style={{ height: height + 'px' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: width + 'px', height: height + 'px' }}
        xmlns="http://www.w3.org/2000/svg"
        className="automation-clip-editor"
        onDoubleClick={e => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {clips.map((clip, i) => {
          const startX = fnToChart(clip.start, width, minX, maxX);
          const endX = fnToChart(clip.end, width, minX, maxX);

          return (
            <React.Fragment key={clip.id}>
              <rect
                className="automation-clip"
                x={startX}
                y={10}
                width={endX - startX}
                height={height - 20}
                stroke="#77f"
                fill="#77f"
                onMouseDown={(e: React.MouseEvent) => {
                  e.preventDefault();
                  startDragging({
                    moving: 'block',
                    initX: e.clientX,
                    clip,
                    i,
                  });
                }}
                onTouchStart={(e: React.TouchEvent) => {
                  e.preventDefault();
                  const touch = e.touches[0];
                  if (!touch) {
                    return;
                  }

                  startDragging({
                    moving: 'block',
                    initX: touch.clientX,
                    clip,
                    i,
                  });
                }}
              />
              <path
                className="automation-clip-start"
                d={`M ${startX} 10 V ${height - 10}`}
                stroke="#77f"
                fill="none"
                strokeWidth={2}
                onMouseDown={(e: React.MouseEvent) => {
                  e.preventDefault();
                  startDragging({
                    moving: 'start',
                    initX: e.clientX,
                    clip,
                    i,
                  });
                }}
                onTouchStart={(e: React.TouchEvent) => {
                  e.preventDefault();
                  const touch = e.touches[0];
                  if (!touch) {
                    return;
                  }

                  startDragging({
                    moving: 'start',
                    initX: touch.clientX,
                    clip,
                    i,
                  });
                }}
              />
              <path
                className="automation-clip-end"
                d={`M ${endX} 10 V ${height - 10}`}
                stroke="#77f"
                fill="none"
                strokeWidth={2}
                onMouseDown={(e: React.MouseEvent) => {
                  e.preventDefault();
                  startDragging({
                    moving: 'end',
                    initX: e.clientX,
                    clip,
                    i,
                  });
                }}
                onTouchStart={(e: React.TouchEvent) => {
                  e.preventDefault();
                  const touch = e.touches[0];
                  if (!touch) {
                    return;
                  }

                  startDragging({
                    moving: 'end',
                    initX: touch.clientX,
                    clip,
                    i,
                  });
                }}
              />
            </React.Fragment>
          );
        })}
      </svg>
    </div>
  );
};