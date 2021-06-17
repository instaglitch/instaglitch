import React from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { VarUI, VarSlider, VarXY } from 'react-var-ui';

import { useProjectStore } from '../../ProjectStore';
import { ImageLayer } from '../../types';

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
        </VarUI>
      </div>
    );
  }
);
