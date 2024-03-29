import React, { useContext, useMemo } from 'react';
import { usePointerDrag } from 'react-use-pointer-drag';

import { TimelineContext } from './TimelineContext';

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
  type: 'timeline' | 'marker';
  initMinX: number;
  initPPS: number;
}

export interface TimeDisplayProps {
  height: number;
}

export const TimeDisplay: React.FC<TimeDisplayProps> = ({ height }) => {
  const { minX, maxX, setMinX, setPPS, PPS, time, setTime } =
    useContext(TimelineContext);

  const width = useMemo(() => (maxX - minX) * PPS, [PPS, minX, maxX]);

  const labels: [number, string][] = [];
  const ticks: [number, boolean][] = [];

  const { dragProps } = usePointerDrag<DragState>({
    onMove: ({ deltaX, deltaY, state }) => {
      if (state.type === 'marker') {
        const newTime = Math.max(state.initMinX + deltaX / state.initPPS, 0);

        setTime(newTime);
      } else {
        const PPS = getExponentAfterDelta(
          state.initPPS,
          deltaY / height,
          0.1,
          40
        );

        setPPS(PPS);
        setMinX(Math.max(0, state.initMinX - deltaX / PPS));
      }
    },
  });

  const { tickResolution, labelResolution } = getResolution(PPS);
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
            setPPS(defaultPPS);
            setMinX(0);
          }}
          onClick={e => {
            e.preventDefault();
            const rect = e.currentTarget.getBoundingClientRect();
            const chartX = e.clientX - rect.left;
            const fnX = chartToFn(chartX, width, minX, maxX);
            setTime(fnX);
          }}
          {...dragProps({
            type: 'timeline',
            initMinX: minX,
            initPPS: PPS,
          })}
        >
          <polygon
            points={`${timeX},${height - 20} ${timeX - 7},0 ${timeX + 7},0`}
            fill="#77f"
            className="time-decoration"
          />
          <rect
            className="clip"
            x={timeX - 10}
            y={0}
            width={20}
            height={height}
            fill="transparent"
            {...dragProps({
              type: 'marker',
              initMinX: time,
              initPPS: PPS,
            })}
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
            className="time-decoration"
          />
        </svg>
      </div>
    </>
  );
};
