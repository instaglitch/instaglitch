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
  VarAngle,
} from 'react-var-ui';

import { useProjectStore } from '../../ProjectStore';
import { FilterLayer, FilterSettingType } from '../../types';

export interface FilterSettingsProps {
  layer: FilterLayer;
}

export const FilterSettings: React.FC<FilterSettingsProps> = observer(
  ({ layer }) => {
    const projectStore = useProjectStore();

    return (
      <div className="layer-settings">
        {!layer.filter?.settings ? (
          'This layer has no settings.'
        ) : (
          <VarUI
            values={toJS(layer.settings)}
            updateValues={(data: any) => {
              layer.settings = data;
              projectStore.requestPreviewRender();
            }}
          >
            {layer.filter.settings.map(setting => {
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
                          key: value.id,
                          label: value.name,
                          value: value.value,
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
    );
  }
);
