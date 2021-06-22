import React, { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { VarUI, VarCategory, VarSlider } from 'react-var-ui';

import { useProjectStore } from '../../ProjectStore';
import { Modal } from '../common/Modal';

export const Export: React.FC = observer(() => {
  const projectStore = useProjectStore();

  const data = useMemo(
    () => ({
      quality: projectStore.exportQuality,
      scale: projectStore.exportScale,
    }),
    [projectStore.exportQuality, projectStore.exportScale]
  );

  const maxSize = useMemo(() => {
    if (!projectStore.currentProject || projectStore.exportScale >= 0.98) {
      return 0;
    }

    const { width, height } = projectStore.currentProject;
    const max = Math.max(width, height);

    return max * projectStore.exportScale;
  }, [projectStore.currentProject, projectStore.exportScale]);

  return (
    <Modal title="Export" onDismiss={() => (projectStore.modal = undefined)}>
      <div className="info">
        <VarUI
          values={data}
          updateValues={data => {
            projectStore.exportScale = data.scale;
            projectStore.exportQuality = data.quality;
          }}
        >
          <VarCategory label="Export settings">
            <VarSlider
              path="scale"
              min={0.1}
              max={1.0}
              step={0.05}
              label="Scale"
            />
            <VarSlider
              path="quality"
              min={0.1}
              max={1.0}
              step={0.05}
              label="Quality (JPEG only)"
            />
          </VarCategory>
        </VarUI>
      </div>
      <div className="actions">
        <button
          onClick={() =>
            projectStore.renderAndSave(
              maxSize,
              'image/jpeg',
              projectStore.exportQuality
            )
          }
        >
          Export JPEG
        </button>
        <button
          onClick={() => projectStore.renderAndSave(maxSize, 'image/png')}
        >
          Export PNG
        </button>
      </div>
    </Modal>
  );
});
