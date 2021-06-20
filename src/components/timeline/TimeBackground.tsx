import React, { useMemo } from 'react';

import { fnToChart, getResolution } from './Utils';

export interface TimeBackgroundProps {
  pixelsPerSecond: number;
  height: number;
  minX: number;
  maxX: number;
  time: number;
}

export const TimeBackground: React.FC<TimeBackgroundProps> = ({
  pixelsPerSecond,
  height,
  minX,
  maxX,
  time,
}) => {
  const width = useMemo(
    () => (maxX - minX) * pixelsPerSecond,
    [pixelsPerSecond, minX, maxX]
  );

  const ticks: [number, boolean][] = [];

  const { tickResolution, labelResolution } = getResolution(pixelsPerSecond);
  for (let x = Math.ceil(minX); x <= Math.floor(maxX); x++) {
    const chartX = fnToChart(x, width, minX, maxX);

    if (x % tickResolution === 0) {
      ticks.push([chartX, x % labelResolution === 0]);
    }
  }

  const timeX = fnToChart(time, width, minX, maxX);

  return (
    <>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: width + 'px' }}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        className="time-background"
      >
        {ticks.map(([x, bold]) => (
          <path
            key={x}
            d={`M ${x} 0 L ${x} ${height}`}
            stroke={bold ? '#7777ff' : '#7777ff50'}
            fill="none"
            strokeWidth={2}
          />
        ))}
        <path
          d={`M ${timeX} 0 L ${timeX} ${height}`}
          stroke={'#77f'}
          fill="none"
          strokeWidth={2}
        />
      </svg>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: width + 'px' }}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        className="time-foreground"
      >
        <path
          d={`M ${timeX} 0 L ${timeX} ${height}`}
          stroke={'#77f'}
          fill="none"
          strokeWidth={2}
        />
      </svg>
    </>
  );
};
