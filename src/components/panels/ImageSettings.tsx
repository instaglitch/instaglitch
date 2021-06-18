import React from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { VarUI, VarSlider, VarXY, VarSelect } from 'react-var-ui';

import { useProjectStore } from '../../ProjectStore';
import { ImageLayer } from '../../types';
import { GlueBlendMode } from 'fxglue';

export interface ImageSettingsProps {
  layer: ImageLayer;
}

export const ImageSettings: React.FC<ImageSettingsProps> = observer(
  ({ layer }) => {
    const projectStore = useProjectStore();

    return (
      <div className="layer-settings">
        <VarUI
          values={toJS(layer.settings)}
          updateValues={(data: any) => {
            layer.settings = data;
            projectStore.requestPreviewRender();
          }}
        >
          <VarXY label="Offset" path="offset" defaultValue={[0, 0]} />
          <VarSlider
            min={0}
            max={1}
            step={0.01}
            path="opacity"
            label="Opacity"
          />
          <VarSlider min={0} max={5} step={0.01} path="scale" label="Scale" />
          <VarSelect
            path="mode"
            label="Blend mode"
            options={[
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
            ]}
          />
        </VarUI>
      </div>
    );
  }
);
