import { Filter } from '../types';
import { RGBOffset } from './color/RGBOffset';
import { Fisheye } from './distort/Fisheye';
import { Scanlines } from './render/Scanlines';
import { Vignette } from './render/Vignette';

export interface FilterCategory {
  id: string;
  name: string;
  description?: string;
  filters: Filter[];
}

export const filterCategories: FilterCategory[] = [
  {
    id: 'distort',
    name: 'Distort',
    filters: [Fisheye],
  },
  {
    id: 'color',
    name: 'Color',
    filters: [RGBOffset],
  },
  {
    id: 'render',
    name: 'Render',
    filters: [Scanlines, Vignette],
  },
];
