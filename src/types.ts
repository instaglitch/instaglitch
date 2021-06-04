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
  fragmentShader: string;
  vertexShader: string;
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
}

export type TLayer = FilterLayer | ImageLayer;

export interface Project {
  id: string;
  filename: string;
  layers: TLayer[];
  selectedLayer: string;
  width: number;
  height: number;
}
