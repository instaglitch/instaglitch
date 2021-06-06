import React from 'react';
import { observer } from 'mobx-react-lite';
import DatGui, {
  DatNumber,
  DatBoolean,
  DatFolder,
  DatColor,
  DatSelect,
} from 'react-dat-gui';

import { useProjectStore } from '../../ProjectStore';
import { FilterSettingType, LayerType } from '../../types';

declare module 'react-dat-gui' {
  interface DatSelectProps extends DatChangableFieldProps {
    options: any[];
    optionLabels: any[];
  }
}

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
          <DatGui
            data={layer.settings}
            onUpdate={data => {
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
                    <DatNumber
                      min={setting.minValue ?? -1}
                      max={setting.maxValue ?? 1}
                      step={setting.step ?? 1}
                      path={setting.key}
                      label={name}
                      key={setting.id}
                    />
                  );
                case FilterSettingType.FLOAT:
                  return (
                    <DatNumber
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
                    <DatColor
                      path={setting.key}
                      label={name}
                      key={setting.id}
                    />
                  );
                case FilterSettingType.BOOLEAN:
                  return (
                    <DatBoolean
                      path={setting.key}
                      label={name}
                      key={setting.id}
                    />
                  );
                case FilterSettingType.OFFSET:
                  return (
                    <DatFolder title={name} closed={false} key={setting.id}>
                      <DatNumber
                        min={-1}
                        max={1}
                        step={0.01}
                        path={setting.key + '.0'}
                        label={'X'}
                      />
                      <DatNumber
                        min={-1}
                        max={1}
                        step={0.01}
                        path={setting.key + '.1'}
                        label={'Y'}
                      />
                    </DatFolder>
                  );
                case FilterSettingType.SELECT:
                  return (
                    <DatSelect
                      path={setting.key}
                      label={name}
                      key={setting.id}
                      options={
                        setting.selectValues?.map(value => value.value) || []
                      }
                      optionLabels={
                        setting.selectValues?.map(value => value.name) || []
                      }
                    />
                  );
              }

              return null;
            })}
          </DatGui>
        )}
      </div>
    </div>
  );
});
