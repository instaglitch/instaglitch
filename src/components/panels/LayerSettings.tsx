import React from 'react';
import { observer } from 'mobx-react-lite';
import Slider from 'rc-slider';

import { useProjectStore } from '../../ProjectStore';
import {
  FilterLayer,
  FilterSetting,
  FilterSettingType,
  LayerType,
} from '../../types';

export const LayerSettingsSetting: React.FC<{
  setting: FilterSetting;
  layer: FilterLayer;
}> = observer(({ setting, layer }) => {
  const projectStore = useProjectStore();
  const value = layer.settings[setting.key];

  const renderSetting = () => {
    switch (setting.type) {
      case FilterSettingType.OFFSET:
        return (
          <>
            <div className="input-wrapper">
              <span>X</span>
              <Slider
                value={value[0]}
                step={0.01}
                min={-1}
                max={1}
                onChange={v => {
                  value[0] = v;
                  projectStore.requestPreviewRender();
                }}
              />
            </div>
            <div className="input-wrapper">
              <span>Y</span>
              <Slider
                value={value[1]}
                step={0.01}
                min={-1}
                max={1}
                onChange={v => {
                  value[1] = v;
                  projectStore.requestPreviewRender();
                }}
              />
            </div>
          </>
        );
      case FilterSettingType.INTEGER:
        return (
          <>
            <Slider
              value={value}
              step={1}
              min={setting.minValue ?? -1}
              max={setting.maxValue ?? 1}
              onChange={v => {
                layer.settings[setting.key] = v;
                projectStore.requestPreviewRender();
              }}
            />
          </>
        );
      case FilterSettingType.FLOAT:
        return (
          <>
            <Slider
              value={value}
              step={0.01}
              min={setting.minValue ?? -1}
              max={setting.maxValue ?? 1}
              onChange={v => {
                layer.settings[setting.key] = v;
                projectStore.requestPreviewRender();
              }}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="layer-setting">
      <strong>{setting.name}</strong>
      {renderSetting()}
    </div>
  );
});

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
        {layer.type === LayerType.IMAGE || !layer.filter?.settings
          ? 'This layer has no settings.'
          : layer.filter.settings.map(setting => (
              <LayerSettingsSetting
                key={setting.key}
                setting={setting}
                layer={layer}
              />
            ))}
      </div>
    </div>
  );
});
