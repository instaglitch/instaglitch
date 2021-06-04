import { v4 as uuid } from 'uuid';

import { Filter, FilterLayer, LayerType } from '../types';

export function createFilterLayer(filter: Filter): FilterLayer {
  const settings: Record<string, any> = {};

  if (filter.settings) {
    for (const setting of filter.settings) {
      settings[setting.key] = setting.defaultValue;
    }
  }

  return {
    id: uuid(),
    type: LayerType.FILTER,
    filter: filter,
    settings,
    visible: true,
  };
}
