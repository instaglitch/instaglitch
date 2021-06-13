import React from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import {
  VarUI,
  VarSlider,
  VarColor,
  VarToggle,
  VarXY,
  VarSelect,
} from 'react-var-ui';

import { useProjectStore } from '../../ProjectStore';
import { FilterSettingType, LayerType } from '../../types';

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
        {layer.type === LayerType.IMAGE || !layer.filter?.settings ? (
          'This layer has no settings.'
        ) : (
          <VarUI
            values={toJS(layer.settings)}
            updateValues={(data: any) => {
              for (const setting of layer.filter.settings!) {
                if (setting.type === FilterSettingType.SELECT) {
                  data[setting.key] = parseInt(data[setting.key]);
                }
              }

              layer.settings = data;
              projectStore.requestPreviewRender();
            }}
          >
            {layer.filter.settings.map(setting => {
              if (!setting.key) {
                return null;
              }

              const name = setting.name || setting.key;

              switch (setting.type) {
                case FilterSettingType.INTEGER:
                  return (
                    <VarSlider
                      min={setting.minValue ?? -1}
                      max={setting.maxValue ?? 1}
                      step={setting.step ?? 1}
                      path={setting.key}
                      label={name}
                      key={setting.id}
                      integer
                    />
                  );
                case FilterSettingType.FLOAT:
                  return (
                    <VarSlider
                      min={setting.minValue ?? -1}
                      max={setting.maxValue ?? 1}
                      step={setting.step ?? 0.01}
                      path={setting.key}
                      label={name}
                      key={setting.id}
                    />
                  );
                case FilterSettingType.COLOR:
                  return (
                    <VarColor
                      path={setting.key}
                      label={name}
                      key={setting.id}
                    />
                  );
                case FilterSettingType.BOOLEAN:
                  return (
                    <VarToggle
                      path={setting.key}
                      label={name}
                      key={setting.id}
                    />
                  );
                case FilterSettingType.OFFSET:
                  return (
                    <VarXY label={name} path={setting.key} key={setting.id} />
                  );
                case FilterSettingType.SELECT:
                  return (
                    <VarSelect
                      path={setting.key}
                      label={name}
                      key={setting.id}
                      options={
                        setting.selectValues?.map(value => ({
                          key: value.id,
                          label: value.name,
                          value: value.value,
                        })) || []
                      }
                    />
                  );
              }

              return null;
            })}
          </VarUI>
        )}
      </div>
    </div>
  );
});
