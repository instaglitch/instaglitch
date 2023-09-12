import React, { useContext, useMemo } from 'react';
import { usePointerDrag } from 'react-use-pointer-drag';
import { v4 as uuid } from 'uuid';

import { AutomationPoint } from '../../types';
import { TimelineContext } from './TimelineContext';

import {
  getExponentAfterDelta,
  getYBetweenTwoPoints,
  chartToFn,
  fnToChart,
} from './Utils';

function roundValue(
  value: number,
  min?: number,
  max?: number,
  step?: number
): number {
  let decimalPlaces = 8;
  if (typeof step === 'number') {
    decimalPlaces = step.toString().split('.')[1]?.length || 0;
    value = Math.round(value / step) * step;
  }

  if (typeof min === 'number') {
    value = Math.max(min, value);
  }

  if (typeof max === 'number') {
    value = Math.min(max, value);
  }

  return parseFloat(value.toFixed(decimalPlaces));
}

interface CurvePart {
  id: string;
  start: [number, number];
  xy: [number, number];
  end?: [number, number];
  path?: string;
  i: number;
  exponent: number;
}

interface DragState {
  moving: 'start' | 'exponent';
  i: number;
  part: CurvePart;
}

export interface CurveEditorProps {
  height: number;
  minY: number;
  maxY: number;
  points: AutomationPoint[];
  onChange: (points: AutomationPoint[]) => void;
  step?: number;
  isBoolean?: boolean;
  previewValue?: number;
}

export const CurveEditor: React.FC<CurveEditorProps> = ({
  height,
  minY,
  maxY,
  points,
  onChange,
  step,
  isBoolean,
  previewValue,
}) => {
  const { minX, maxX, PPS } = useContext(TimelineContext);

  const width = useMemo(() => (maxX - minX) * PPS, [PPS, minX, maxX]);

  const { dragProps } = usePointerDrag<DragState>({
    preventDefault: true,
    stopPropagation: true,
    pointerDownPreventDefault: true,
    pointerDownStopPropagation: true,
    onMove: ({ deltaX, deltaY, state }) => {
      const i = state.i;

      if (state.moving === 'exponent') {
        const yDiff =
          state.part.end && state.part.end[1] > state.part.start[1]
            ? -deltaY
            : deltaY;
        const exponent = getExponentAfterDelta(
          state.part.exponent,
          (yDiff / height) * 50
        );

        points[i].exponent = exponent;
        onChange([...points]);
      } else {
        const unitY = height / (maxY - minY);

        let newX = state.part.xy[0] + deltaX / PPS;
        let newY = state.part.xy[1] - deltaY / unitY;

        if (state.i > 0) {
          if (newX < points[i - 1].x) {
            newX = points[i - 1].x;
          }
        }

        if (typeof points[i + 1] !== 'undefined') {
          if (newX > points[i + 1].x) {
            newX = points[i + 1].x;
          }
        }

        newX = Math.max(0, newX);

        newY = roundValue(newY, minY, maxY, step);

        points[state.i].x = newX;
        points[state.i].y = newY;

        onChange([...points]);
      }
    },
  });

  const parts: CurvePart[] = [];
  let fillPath = '';

  if (points.length > 0) {
    fillPath = 'M 0 ' + (height - fnToChart(0, height, minY, maxY));
    let x = fnToChart(points[0].x, width, minX, maxX);

    fillPath += ' L 0 ' + (height - fnToChart(points[0].y, height, minY, maxY));

    for (let i = 0; i < points.length; i++) {
      const point = points[i];

      const startX = point.x;
      const startY = point.y;
      const exponent = point.exponent;

      const next = i + 1;

      const partPoints: [number, number][] = [];
      let endX: number | undefined = undefined;
      let endY: number | undefined = undefined;

      if (typeof points[next] !== 'undefined') {
        endX = points[next].x;
        endY = points[next].y;

        const endChartX = fnToChart(endX, width, minX, maxX);

        while (x < endChartX) {
          const fnX = chartToFn(x, width, minX, maxX);
          let fnY = getYBetweenTwoPoints(
            fnX,
            startX,
            startY,
            endX,
            endY,
            exponent
          );

          if (isBoolean) {
            fnY = Math.floor(fnY);
          }

          const chartY = height - fnToChart(fnY, height, minY, maxY);

          partPoints.push([x, chartY]);

          x += 1;
        }

        partPoints.push([
          endChartX,
          height - fnToChart(endY, height, minY, maxY),
        ]);
        x = endChartX;
      } else {
        const lastY = height - fnToChart(startY, height, minY, maxY);
        partPoints.push([x, lastY]);
        partPoints.push([width, lastY]);
      }

      const start: [number, number] | undefined =
        typeof startX !== 'undefined'
          ? [
              fnToChart(startX, width, minX, maxX),
              height - fnToChart(startY, height, minY, maxY),
            ]
          : undefined;

      const end: [number, number] | undefined =
        typeof endX !== 'undefined'
          ? [
              fnToChart(endX, width, minX, maxX),
              height - fnToChart(endY!, height, minY, maxY),
            ]
          : undefined;

      if (typeof start !== 'undefined') {
        let path: string | undefined = undefined;
        if (points.length > 0 || typeof end !== 'undefined') {
          path = 'M ' + start[0] + ' ' + start[1];
          fillPath += ' L ' + start[0] + ' ' + start[1];
          for (const point of partPoints) {
            path += ' L ' + point[0] + ' ' + point[1];
            fillPath += ' L ' + point[0] + ' ' + point[1];
          }
        }

        parts.push({
          id: point.id,
          i,
          path,
          start,
          xy: [startX, startY],
          end,
          exponent,
        });
      }
    }

    fillPath +=
      ' L ' + width + ' ' + (height - fnToChart(0, height, minY, maxY));
  } else if (typeof previewValue !== 'undefined') {
    fillPath = 'M 0 ' + (height - fnToChart(0, height, minY, maxY));
    fillPath +=
      ' L 0 ' + (height - fnToChart(previewValue, height, minY, maxY));
    fillPath +=
      ' L ' +
      width +
      ' ' +
      (height - fnToChart(previewValue, height, minY, maxY));
    fillPath +=
      ' L ' + width + ' ' + (height - fnToChart(0, height, minY, maxY));
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: width + 'px', height: height + 'px' }}
      xmlns="http://www.w3.org/2000/svg"
      className="curve-editor"
      onDoubleClick={e => {
        e.preventDefault();
        e.stopPropagation();

        const rect = e.currentTarget.getBoundingClientRect();
        const chartX = e.clientX - rect.left;
        const chartY = e.clientY - rect.top;
        const fnX = chartToFn(chartX, width, minX, maxX);
        let fnY = chartToFn(height - chartY, height, minY, maxY);
        fnY = roundValue(fnY, minY, maxY, step);

        let insertAt: number | undefined = undefined;
        if (points.length > 0) {
          for (let i = 0; i < points.length; i++) {
            if (points[i].x >= fnX) {
              insertAt = i;
              break;
            }
          }
        }

        const newCurve = [...points];

        if (typeof insertAt === 'undefined') {
          newCurve.push({
            id: uuid(),
            exponent: 1,
            x: fnX,
            y: fnY,
          });
        } else {
          newCurve.splice(insertAt, 0, {
            id: uuid(),
            exponent: 1,
            x: fnX,
            y: fnY,
          });
        }

        onChange(newCurve);
      }}
    >
      <path
        className="fill-path"
        d={fillPath}
        stroke="transparent"
        fill="#7777ff50"
        strokeWidth={2}
      />
      {parts.map(
        part =>
          !!part.path && (
            <path
              key={part.id}
              className="curve"
              d={part.path}
              stroke="#77f"
              fill="none"
              strokeWidth={2}
              {...dragProps({
                i: part.i,
                moving: 'exponent',
                part,
              })}
            />
          )
      )}
      {parts.map(part => (
        <circle
          key={part.id}
          cx={part.start[0]}
          cy={part.start[1]}
          r="5"
          fill="#77f"
          className="curve-point"
          {...dragProps({
            i: part.i,
            moving: 'start',
            part,
          })}
          onDoubleClick={e => {
            e.preventDefault();
            e.stopPropagation();

            const newPoints = [...points];
            newPoints.splice(part.i, 1);
            onChange(newPoints);
          }}
        />
      ))}
    </svg>
  );
};
