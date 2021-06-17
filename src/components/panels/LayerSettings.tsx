import React from 'react';
import { observer } from 'mobx-react-lite';

import { useProjectStore } from '../../ProjectStore';
import { LayerType } from '../../types';
import { ImageSettings } from './ImageSettings';
import { FilterSettings } from './FilterSettings';

export const LayerSettings: React.FC = observer(() => {
  const projectStore = useProjectStore();
  const project = projectStore.currentProject;

  if (!project) {
    return null;
  }

  const layer = project.layers.find(
    layer => layer.id === project.selectedLayer
  );

  if (!layer) {
    return null;
  }

  return (
    <div className="subpanel">
      <strong>Layer settings</strong>
      <div className="layer-settings">
        {layer.type === LayerType.IMAGE ? (
          <ImageSettings layer={layer} />
        ) : (
          <FilterSettings layer={layer} />
        )}
      </div>
    </div>
  );
});
