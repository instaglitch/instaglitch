import { Filter } from '../types';
import { filtersRender } from './render';
import { filtersDistort } from './distort';
import { filtersColor } from './color';
import { filtersWarp } from './warp';
import { buildShaderFilter } from './buildShaderFilter';

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
    filters: filtersDistort.map(buildShaderFilter),
  },
  {
    id: 'color',
    name: 'Color',
    filters: filtersColor.map(buildShaderFilter),
  },
  {
    id: 'render',
    name: 'Render',
    filters: filtersRender.map(buildShaderFilter),
  },
  {
    id: 'warp',
    name: 'Wrap',
    filters: filtersWarp.map(buildShaderFilter),
  },
];

export const filters: Filter[] = filterCategories.flatMap(
  category => category.filters
);
