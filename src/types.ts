import { GlueBlendMode } from 'fxglue';

export enum LayerType {
  IMAGE,
  FILTER,
}

export interface Layer {
  id: string;
  type: LayerType;
  visible: boolean;
}

export enum FilterSettingType {
  OFFSET = 'offset',
  COLOR = 'color',
  INTEGER = 'integer',
  FLOAT = 'float',
  BOOLEAN = 'boolean',
  SELECT = 'select',
  ANGLE = 'angle',
}

export interface FilterSettingSelectValue {
  id: string;
  name: string;
  value: number;
}

export interface FilterSetting {
  id: string;
  key: string;
  name: string;
  description?: string;
  type: FilterSettingType;
  defaultValue: any;
  minValue?: number;
  maxValue?: number;
  color?: string;
  step?: number;
  selectValues?: FilterSettingSelectValue[];
}

export interface Filter {
  id: string;
  name: string;
  description?: string;
  settings?: FilterSetting[];
  fragmentShader: string;
  vertexShader: string;
}

export interface FilterLayer extends Layer {
  id: string;
  type: LayerType.FILTER;
  readonly filter: Filter;
  settings: Record<string, any>;
}

export interface ImageLayerSettings {
  offset: [number, number];
  opacity: number;
  scale: number;
  mode: GlueBlendMode;
}

export interface ImageLayer extends Layer {
  id: string;
  type: LayerType.IMAGE;
  readonly image: HTMLImageElement;
  settings: ImageLayerSettings;
  name?: string;
}

export type TLayer = FilterLayer | ImageLayer;

export interface Project {
  id: string;
  filename: string;
  layers: TLayer[];
  selectedLayer: string;
  width: number;
  height: number;
  animated: boolean;
  time: number;
  playing: boolean;
  clips: Record<string, AutomationClip[]>;
  points: Record<string, Record<string, AutomationPoint[]>>;
}

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
