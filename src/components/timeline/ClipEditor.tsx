import React, { useContext, useMemo } from 'react';
import { usePointerDrag } from 'react-use-pointer-drag';
import { nanoid } from 'nanoid';

import { AutomationClip } from '../../types';
import { TimelineContext } from './TimelineContext';
import { chartToFn, fnToChart } from './Utils';

interface DragState {
  moving: 'start' | 'block' | 'end';
  clip: AutomationClip;
  i: number;
}

export interface ClipEditorProps {
  height: number;
  clips: AutomationClip[];
  onChange: (clips: AutomationClip[]) => void;
}

export const ClipEditor: React.FC<ClipEditorProps> = ({
  height,
  clips,
  onChange,
}) => {
  const { minX, maxX, PPS } = useContext(TimelineContext);

  const width = useMemo(() => (maxX - minX) * PPS, [PPS, minX, maxX]);

  const { dragProps } = usePointerDrag<DragState>({
    preventDefault: true,
    stopPropagation: true,
    pointerDownPreventDefault: true,
    pointerDownStopPropagation: true,
    onMove: ({ deltaX, state }) => {
      const clip = state.clip;
      const delta = deltaX / PPS;
      const i = state.i;

      const hasAbsolute =
        typeof clip.absoluteStart === 'number' &&
        typeof clip.duration === 'number';

      let newStart = clip.start;
      let newEnd = clip.end;

      if (state.moving !== 'start') {
        newEnd += delta;
      }
      if (state.moving !== 'end') {
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

      if (newStart < 0) {
        newEnd += -1 * newStart;
        newStart = 0;
      }

      const newClip: AutomationClip = {
        ...clip,
      };

      if (state.moving !== 'start') {
        newClip.end = newEnd;
      }
      if (state.moving !== 'end') {
        newClip.start = newStart;
      }

      if (hasAbsolute) {
        if (state.moving !== 'start') {
          newClip.absoluteStart! += newStart - clip.start;
        }

        newClip.start = Math.max(newClip.absoluteStart!, newClip.start);
        newClip.end = Math.min(
          newClip.absoluteStart! + newClip.duration!,
          newClip.end
        );
      }

      clips[i] = newClip;

      onChange(clips);
    },
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: width + 'px', height: height + 'px' }}
      xmlns="http://www.w3.org/2000/svg"
      className="clip-editor"
      onDoubleClick={e => {
        e.preventDefault();
        e.stopPropagation();

        const rect = e.currentTarget.getBoundingClientRect();
        const chartX = e.clientX - rect.left;
        const fnX = chartToFn(chartX, width, minX, maxX);

        let insertAt: number | undefined = undefined;
        if (clips.length > 0) {
          for (let i = 0; i < clips.length; i++) {
            if (clips[i].end >= fnX) {
              insertAt = i;
              break;
            }
          }
        }

        const newClips = [...clips];

        if (typeof insertAt === 'undefined') {
          newClips.push({
            id: nanoid(),
            start: fnX,
            end: fnX + 1,
          });
        } else {
          newClips.splice(insertAt, 0, {
            id: nanoid(),
            start: fnX,
            end: fnX + 1,
          });
        }

        onChange(newClips);
      }}
    >
      {clips.map((clip, i) => {
        const hasAbsolute =
          typeof clip.absoluteStart === 'number' &&
          typeof clip.duration === 'number';
        const absoluteStartX = hasAbsolute
          ? fnToChart(clip.absoluteStart!, width, minX, maxX)
          : undefined;
        const absoluteEndX = hasAbsolute
          ? fnToChart(clip.absoluteStart! + clip.duration!, width, minX, maxX)
          : undefined;
        const startX = fnToChart(clip.start, width, minX, maxX);
        const endX = fnToChart(clip.end, width, minX, maxX);

        return (
          <React.Fragment key={clip.id}>
            {hasAbsolute && (
              <rect
                className="clip-absolute"
                x={absoluteStartX}
                y={10}
                width={absoluteEndX! - absoluteStartX!}
                height={height - 20}
                stroke="#77f"
                fill="#77f"
              />
            )}
            <rect
              className="clip"
              x={startX}
              y={10}
              width={endX - startX}
              height={height - 20}
              stroke="#77f"
              fill="#77f"
              {...dragProps({
                moving: 'block',
                clip,
                i,
              })}
            />
            <path
              className="clip-start"
              d={`M ${startX} 10 V ${height - 10}`}
              stroke="#77f"
              fill="none"
              strokeWidth={2}
              {...dragProps({
                moving: 'start',
                clip,
                i,
              })}
            />
            <path
              className="clip-end"
              d={`M ${endX} 10 V ${height - 10}`}
              stroke="#77f"
              fill="none"
              strokeWidth={2}
              {...dragProps({
                moving: 'end',
                clip,
                i,
              })}
            />
          </React.Fragment>
        );
      })}
    </svg>
  );
};
