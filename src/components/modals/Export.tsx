import React, { useMemo } from 'react';
import { observer } from 'mobx-react-lite';

import { useProjectStore } from '../../ProjectStore';
import { Modal } from '../common/Modal';
import DatGui, { DatFolder, DatNumber } from 'react-dat-gui';

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

  if (!projectStore.showExport) {
    return null;
  }

  return (
    <Modal title="Export" onDismiss={() => (projectStore.showExport = false)}>
      <div className="info">
        <DatGui
          data={data}
          onUpdate={data => {
            projectStore.exportScale = data.scale;
            projectStore.exportQuality = data.quality;
          }}
        >
          <DatFolder title="Export settings" closed={false}>
            <DatNumber
              path="scale"
              min={0.1}
              max={1.0}
              step={0.05}
              label="Scale"
            />
            <DatNumber
              path="quality"
              min={0.1}
              max={1.0}
              step={0.05}
              label="Quality (JPEG only)"
            />
          </DatFolder>
        </DatGui>
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
