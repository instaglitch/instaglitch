import React, { useCallback, useMemo } from 'react';
import { usePointerDrag } from 'react-use-pointer-drag';

import {
  getExponentAfterDelta,
  fnToChart,
  getResolution,
  defaultPPS,
  chartToFn,
} from './Utils';

function timeDisplay(s: number) {
  return Math.floor(s / 60) + ':' + ((s % 60) + '').padStart(2, '0');
}

interface DragState {
  initX: number;
  initY: number;
  initMinX: number;
  initPPS: number;
}

export interface TimeDisplayProps {
  pixelsPerSecond: number;
  height: number;
  minX: number;
  maxX: number;
  time: number;
  onUpdate: (PPS: number, minX: number) => void;
  onUpdateTime: (time: number) => void;
}

export const TimeDisplay: React.FC<TimeDisplayProps> = ({
  pixelsPerSecond,
  height,
  minX,
  maxX,
  onUpdate,
  time,
  onUpdateTime,
}) => {
  const width = useMemo(
    () => (maxX - minX) * pixelsPerSecond,
    [pixelsPerSecond, minX, maxX]
  );

  const labels: [number, string][] = [];
  const ticks: [number, boolean][] = [];

  const updatePosition = useCallback(
    (x: number, y: number, dragState: DragState) => {
      const deltaY = (y - dragState.initY) / height;
      const PPS = getExponentAfterDelta(dragState.initPPS, deltaY, 0.1, 40);

      const deltaX = (x - dragState.initX) / PPS;

      onUpdate(PPS, Math.max(0, dragState.initMinX - deltaX));
    },
    [height, onUpdate]
  );

  const { startDragging } = usePointerDrag<DragState>(updatePosition);

  const { tickResolution, labelResolution } = getResolution(pixelsPerSecond);
  for (let x = Math.ceil(minX); x <= Math.floor(maxX); x++) {
    const chartX = fnToChart(x, width, minX, maxX);

    if (x % labelResolution === 0) {
      labels.push([chartX, timeDisplay(x)]);
    }
    if (x % tickResolution === 0) {
      ticks.push([chartX, x % labelResolution === 0]);
    }
  }

  const timeX = fnToChart(time, width, minX, maxX);

  return (
    <>
      <div className="timeline-item-wrapper" style={{ height: height + 'px' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: width + 'px', height: height + 'px' }}
          xmlns="http://www.w3.org/2000/svg"
          className="time-display"
          onDoubleClick={e => {
            e.preventDefault();
            onUpdate(defaultPPS, 0);
          }}
          onClick={e => {
            e.preventDefault();
            const rect = e.currentTarget.getBoundingClientRect();
            const chartX = e.clientX - rect.left;
            const fnX = chartToFn(chartX, width, minX, maxX);
            onUpdateTime(fnX);
          }}
          onMouseDown={(e: React.MouseEvent) => {
            e.preventDefault();
            startDragging({
              initX: e.pageX,
              initY: e.pageY,
              initMinX: minX,
              initPPS: pixelsPerSecond,
            });
          }}
          onTouchStart={(e: React.TouchEvent) => {
            e.preventDefault();
            const touch = e.touches[0];
            if (!touch) {
              return;
            }

            startDragging({
              initX: touch.pageX,
              initY: touch.pageY,
              initMinX: minX,
              initPPS: pixelsPerSecond,
            });
          }}
        >
          <polygon
            points={`${timeX},${height - 20} ${timeX - 7},0 ${timeX + 7},0`}
            fill="#77f"
          />
          {ticks.map(([x, bold]) => (
            <path
              key={x}
              d={`M ${x} 0 L ${x} ${height - (bold ? 20 : 25)}`}
              stroke={bold ? '#7777ff' : '#7777ff50'}
              fill="none"
              strokeWidth={2}
            />
          ))}
          {labels.map(([x, label]) => (
            <text
              key={x}
              x={x}
              y={height - 10}
              fontSize="10px"
              textAnchor="middle"
              fill="white"
            >
              {label}
            </text>
          ))}
          <path
            d={`M ${timeX} 0 L ${timeX} ${height}`}
            stroke={'#77f'}
            fill="none"
            strokeWidth={2}
          />
        </svg>
      </div>
    </>
  );
};
