import React from 'react';
import { observer } from 'mobx-react-lite';

import { useProjectStore } from '../../ProjectStore';
import { FilterSettingType, LayerType } from '../../types';
import { PreviewCanvas } from './PreviewCanvas';

export const Preview: React.FC = observer(() => {
  const projectStore = useProjectStore();
  const project = projectStore.currentProject;

  if (!project) {
    return null;
  }

  const layer = project.layers.find(
    layer => layer.id === project.selectedLayer
  );

  const renderOffsetMarks = () => {
    if (layer?.type !== LayerType.FILTER || !layer.filter.settings) {
      return null;
    }

    const offsetSettings = layer.filter.settings.filter(
      setting => setting.type === FilterSettingType.OFFSET
    );
    if (offsetSettings.length === 0) {
      return null;
    }

    return offsetSettings.map(setting => {
      const [x, y] = layer.settings[setting.key];

      return (
        <div
          key={setting.key}
          className="offset-mark"
          style={{
            backgroundColor: setting.color,
            top: (y + 0.5) * project.previewCanvas.height,
            left: (x + 0.5) * project.previewCanvas.width,
          }}
        />
      );
    });
  };

  return (
    <div className="preview-wrap">
      {renderOffsetMarks()}
      <PreviewCanvas />
    </div>
  );
});
