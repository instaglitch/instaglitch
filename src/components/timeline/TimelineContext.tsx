import { createContext } from 'react';

export interface ITimelineContext {
  minX: number;
  maxX: number;
  time: number;
  PPS: number;
  setTime: (time: number) => void;
  setPPS: (PPS: number) => void;
  setMinX: (minX: number) => void;
}

export const TimelineContext = createContext<ITimelineContext>(
  undefined as any
);
