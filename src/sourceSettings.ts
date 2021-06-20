import { GlueBlendMode } from 'fxglue';
import { FilterSetting, FilterSettingType } from './types';

export const sourceSettings: FilterSetting[] = [
  {
    id: 'offset',
    defaultValue: [0, 0],
    key: 'offset',
    name: 'Offset',
    type: FilterSettingType.OFFSET,
  },
  {
    id: 'opacity',
    defaultValue: 1,
    key: 'opacity',
    name: 'Opacity',
    type: FilterSettingType.FLOAT,
    step: 0.01,
    minValue: 0,
    maxValue: 1,
  },
  {
    id: 'scale',
    defaultValue: 1,
    key: 'scale',
    name: 'Scale',
    type: FilterSettingType.FLOAT,
    step: 0.01,
    minValue: 0,
    maxValue: 5,
  },
  {
    id: 'mode',
    defaultValue: GlueBlendMode.NORMAL,
    key: 'mode',
    name: 'Blend mode',
    type: FilterSettingType.SELECT,
    selectValues: [
      {
        key: GlueBlendMode.NORMAL,
        label: 'Normal',
      },
      {
        key: GlueBlendMode.MULTIPLY,
        label: 'Multiply',
      },
      {
        key: GlueBlendMode.SCREEN,
        label: 'Screen',
      },
      {
        key: GlueBlendMode.OVERLAY,
        label: 'Overlay',
      },
      {
        key: GlueBlendMode.HARD_LIGHT,
        label: 'Hard light',
      },
      {
        key: GlueBlendMode.SOFT_LIGHT,
        label: 'Soft light',
      },
      {
        key: GlueBlendMode.DARKEN,
        label: 'Darken',
      },
      {
        key: GlueBlendMode.LIGHTEN,
        label: 'Lighten',
      },
      {
        key: GlueBlendMode.COLOR_DODGE,
        label: 'Color dodge',
      },
      {
        key: GlueBlendMode.COLOR_BURN,
        label: 'Color burn',
      },
      {
        key: GlueBlendMode.EXCLUSION,
        label: 'Exclusion',
      },
      {
        key: GlueBlendMode.HUE,
        label: 'Hue',
      },
      {
        key: GlueBlendMode.SATURATION,
        label: 'Saturation',
      },
      {
        key: GlueBlendMode.COLOR,
        label: 'Color',
      },
      {
        key: GlueBlendMode.LUMINOSITY,
        label: 'Luminosity',
      },
    ],
  },
];
