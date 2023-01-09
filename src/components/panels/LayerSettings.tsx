import React from 'react';
import {
  VarUI,
  VarSlider,
  VarColor,
  VarToggle,
  VarXY,
  VarSelect,
  VarAngle,
} from 'react-var-ui';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';

import { useProjectStore } from '../../ProjectStore';
import { FilterSettingType, LayerType } from '../../types';
import { sourceSettings } from '../../sourceSettings';

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

  const settings =
    layer.type === LayerType.SOURCE ? sourceSettings : layer.filter.settings;

  return (
    <div className="subpanel">
      <strong>Layer settings</strong>
      <div className="layer-settings">
        <div className="layer-settings">
          {!settings ? (
            'This layer has no settings.'
          ) : (
            <VarUI
              values={toJS(layer.settings)}
              updateValues={(data: any) => {
                layer.settings = data;
                projectStore.requestPreviewRender();
              }}
            >
              {settings.map(setting => {
                if (!setting.key) {
                  return null;
                }

                const points = projectStore.currentProject!.points[layer.id];

                const name = setting.name || setting.key;
                const disabled =
                  setting.type === FilterSettingType.OFFSET
                    ? points?.[setting.key + '_x']?.length > 0 ||
                      points?.[setting.key + '_y']?.length > 0
                    : points?.[setting.key]?.length > 0;

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
                        defaultValue={setting.defaultValue}
                        integer
                        disabled={disabled}
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
                        defaultValue={setting.defaultValue}
                        key={setting.id}
                        disabled={disabled}
                      />
                    );
                  case FilterSettingType.COLOR:
                    return (
                      <VarColor
                        path={setting.key}
                        label={name}
                        key={setting.id}
                        defaultValue={setting.defaultValue}
                        disabled={disabled}
                        alpha={setting.alpha}
                      />
                    );
                  case FilterSettingType.BOOLEAN:
                    return (
                      <VarToggle
                        path={setting.key}
                        label={name}
                        key={setting.id}
                        defaultValue={setting.defaultValue}
                        disabled={disabled}
                      />
                    );
                  case FilterSettingType.OFFSET:
                    return (
                      <VarXY
                        label={name}
                        path={setting.key}
                        key={setting.id}
                        defaultValue={setting.defaultValue}
                        disabled={disabled}
                      />
                    );
                  case FilterSettingType.SELECT:
                    return (
                      <VarSelect
                        path={setting.key}
                        label={name}
                        key={setting.id}
                        options={
                          setting.selectValues?.map(value => ({
                            ...value,
                          })) || []
                        }
                        defaultValue={setting.defaultValue}
                        disabled={disabled}
                      />
                    );
                  case FilterSettingType.ANGLE:
                    return (
                      <VarAngle
                        label={name}
                        path={setting.key}
                        key={setting.id}
                        defaultValue={setting.defaultValue}
                        disabled={disabled}
                      />
                    );
                }

                return null;
              })}
            </VarUI>
          )}
        </div>
      </div>
    </div>
  );
});
