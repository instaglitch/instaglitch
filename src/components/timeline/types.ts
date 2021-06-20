export interface AutomationPoint {
  id: string;
  x: number;
  y: number;
  exponent: number;
}

export interface AutomationProperty {
  id: string;
  name: string;
  points: AutomationPoint[];
  min: number;
  max: number;
  step?: number;
  isBoolean?: boolean;
}

export interface AutomationClip {
  id: string;
  start: number;
  end: number;
}

export interface AutomationLayer {
  id: string;
  name: string;
  clips: AutomationClip[];
  properties: AutomationProperty[];
}
