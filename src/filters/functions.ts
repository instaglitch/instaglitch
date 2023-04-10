import { GlueSourceType } from 'fxglue';
import { v4 as uuid } from 'uuid';

import { sourceSettings } from '../sourceSettings';
import {
  Filter,
  FilterLayer,
  GroupLayer,
  LayerType,
  SourceLayer,
} from '../types';

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

export function createSourceLayer(source: GlueSourceType): SourceLayer {
  if (source instanceof HTMLVideoElement) {
    source.muted = true;
  }

  const settings: Record<string, any> = {};

  for (const setting of sourceSettings) {
    settings[setting.key] = setting.defaultValue;
  }

  return {
    id: uuid(),
    type: LayerType.SOURCE,
    source,
    visible: true,
    settings,
  };
}

export function createGroupLayer(): GroupLayer {
  const settings: Record<string, any> = {};

  for (const setting of sourceSettings) {
    settings[setting.key] = setting.defaultValue;
  }

  return {
    id: uuid(),
    type: LayerType.GROUP,
    visible: true,
    settings,
    isCollapsed: false,
  };
}
