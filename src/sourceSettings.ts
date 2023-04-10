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
    id: 'angle',
    defaultValue: 0,
    key: 'angle',
    name: 'Rotation',
    type: FilterSettingType.ANGLE,
  },
  {
    id: 'mode',
    defaultValue: GlueBlendMode.NORMAL,
    key: 'mode',
    name: 'Blend mode',
    type: FilterSettingType.SELECT,
    selectValues: [
      {
        key: 'normal',
        label: 'Normal',
        value: GlueBlendMode.NORMAL,
      },
      {
        key: 'dissolve',
        label: 'Dissolve',
        value: GlueBlendMode.DISSOLVE,
      },

      {
        key: 'darken',
        label: 'Darken',
        value: GlueBlendMode.DARKEN,
      },
      {
        key: 'multiply',
        label: 'Multiply',
        value: GlueBlendMode.MULTIPLY,
      },
      {
        key: 'color_burn',
        label: 'Color burn',
        value: GlueBlendMode.COLOR_BURN,
      },
      {
        key: 'linear_burn',
        label: 'Linear burn',
        value: GlueBlendMode.LINEAR_BURN,
      },

      {
        key: 'lighten',
        label: 'Lighten',
        value: GlueBlendMode.LIGHTEN,
      },
      {
        key: 'screen',
        label: 'Screen',
        value: GlueBlendMode.SCREEN,
      },
      {
        key: 'color_dodge',
        label: 'Color dodge',
        value: GlueBlendMode.COLOR_DODGE,
      },
      {
        key: 'linear_dodge',
        label: 'Linear dodge (Add)',
        value: GlueBlendMode.LINEAR_DODGE,
      },

      {
        key: 'overlay',
        label: 'Overlay',
        value: GlueBlendMode.OVERLAY,
      },
      {
        key: 'soft_light',
        label: 'Soft light',
        value: GlueBlendMode.SOFT_LIGHT,
      },
      {
        key: 'hard_light',
        label: 'Hard light',
        value: GlueBlendMode.HARD_LIGHT,
      },
      {
        key: 'vivid_light',
        label: 'Vivid light',
        value: GlueBlendMode.VIVID_LIGHT,
      },
      {
        key: 'linear_light',
        label: 'Linear light',
        value: GlueBlendMode.LINEAR_LIGHT,
      },
      {
        key: 'pin_light',
        label: 'Pin light',
        value: GlueBlendMode.PIN_LIGHT,
      },
      {
        key: 'hard_mix',
        label: 'Hard mix',
        value: GlueBlendMode.HARD_MIX,
      },

      {
        key: 'difference',
        label: 'Difference',
        value: GlueBlendMode.DIFFERENCE,
      },
      {
        key: 'exclusion',
        label: 'Exclusion',
        value: GlueBlendMode.EXCLUSION,
      },
      {
        key: 'subtract',
        label: 'Subtract',
        value: GlueBlendMode.SUBTRACT,
      },
      {
        key: 'divide',
        label: 'Divide',
        value: GlueBlendMode.DIVIDE,
      },

      {
        key: 'hue',
        label: 'Hue',
        value: GlueBlendMode.HUE,
      },
      {
        key: 'saturation',
        label: 'Saturation',
        value: GlueBlendMode.SATURATION,
      },
      {
        key: 'color',
        label: 'Color',
        value: GlueBlendMode.COLOR,
      },
      {
        key: 'luminosity',
        label: 'Luminosity',
        value: GlueBlendMode.LUMINOSITY,
      },

      {
        key: 'darker_color',
        label: 'Darker color',
        value: GlueBlendMode.DARKER_COLOR,
      },
      {
        key: 'lighter_color',
        label: 'Lighter color',
        value: GlueBlendMode.LIGHTER_COLOR,
      },
    ],
  },
];
