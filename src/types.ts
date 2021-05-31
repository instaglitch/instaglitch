import { WebGLRenderer, Texture } from 'three';

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
  OFFSET,
  COLOR,
  INTEGER,
  FLOAT,
  BOOLEAN,
}

export interface FilterSetting {
  key: string;
  name: string;
  description?: string;
  type: FilterSettingType;
  defaultValue: any;
  minValue?: number;
  maxValue?: number;
  color?: string;
  step?: number;
}

export interface Filter {
  id: string;
  name: string;
  description?: string;
  settings?: FilterSetting[];
  pass: (
    renderer: WebGLRenderer,
    texture: Texture,
    width: number,
    height: number,
    final: boolean,
    settings?: Record<string, any>
  ) => Texture | undefined;
}

export interface FilterLayer extends Layer {
  id: string;
  type: LayerType.FILTER;
  readonly filter: Filter;
  settings: Record<string, any>;
}

export interface ImageLayer extends Layer {
  id: string;
  type: LayerType.IMAGE;
  readonly image: HTMLImageElement;
  texture?: Texture;
}

export type TLayer = FilterLayer | ImageLayer;

export interface Project {
  id: string;
  filename: string;
  previewCanvas: HTMLCanvasElement;
  previewRenderer: WebGLRenderer;
  layers: TLayer[];
  selectedLayer: string;
  width: number;
  height: number;
}
