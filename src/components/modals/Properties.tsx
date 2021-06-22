import React, { useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  VarUI,
  VarCategory,
  VarNumber,
  VarSelect,
  VarToggle,
} from 'react-var-ui';

import { useProjectStore } from '../../ProjectStore';
import { Modal } from '../common/Modal';

export const Properties: React.FC = observer(() => {
  const projectStore = useProjectStore();
  const [aspectRatio, setAspectRatio] =
    useState<[number, number] | undefined>(undefined);

  const width = projectStore.currentProject?.width;
  const height = projectStore.currentProject?.height;
  const animated = projectStore.currentProject?.animated;

  const data = useMemo(
    () => ({
      width,
      height,
      aspectRatio,
      animated,
    }),
    [width, height, animated, aspectRatio]
  );

  return (
    <Modal
      title="Project properties"
      onDismiss={() => (projectStore.modal = undefined)}
    >
      <div className="info">
        <VarUI
          values={data}
          updateValues={data => {
            setAspectRatio(data.aspectRatio);
            if (!projectStore.currentProject) {
              return;
            }

            if (data.aspectRatio) {
              const { width } = projectStore.currentProject;
              if (data.width !== width) {
                projectStore.currentProject.width = data.width;
                projectStore.currentProject.height =
                  (data.width / data.aspectRatio[0]) * data.aspectRatio[1];
              } else {
                projectStore.currentProject.width =
                  (data.height / data.aspectRatio[1]) * data.aspectRatio[0];
                projectStore.currentProject.height = data.height;
              }
            } else {
              projectStore.currentProject.width = data.width;
              projectStore.currentProject.height = data.height;
            }

            projectStore.currentProject.animated = data.animated;

            if (!data.animated) {
              projectStore.currentProject.playing = false;
              projectStore.currentProject.time = 0;
            }

            projectStore.requestPreviewRender();
          }}
        >
          <VarCategory label="Export settings">
            <VarNumber path="height" min={1} step={1} label="Height" />
            <VarNumber path="width" min={1} step={1} label="Width" />
            <VarSelect
              path="aspectRatio"
              label="Aspect ratio"
              options={[
                {
                  key: 'none',
                  label: 'No aspect ratio',
                  value: undefined,
                },
                {
                  key: '1-1',
                  label: '1 : 1 (Square)',
                  value: [1, 1],
                },
                {
                  key: '9-16',
                  label: '9 : 16 (Vertical)',
                  value: [9, 16],
                },
                {
                  key: '10-16',
                  label: '10 : 16 (Vertical)',
                  value: [10, 16],
                },
                {
                  key: '16-9',
                  label: '16 : 9 (Horizontal)',
                  value: [16, 9],
                },
                {
                  key: '16-10',
                  label: '16 : 10 (Horizontal)',
                  value: [16, 10],
                },
              ]}
            />
            <VarToggle
              path="animated"
              label="Enable animation tools (experimental)"
            />
          </VarCategory>
        </VarUI>
      </div>
    </Modal>
  );
});
