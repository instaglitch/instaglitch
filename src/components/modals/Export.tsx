import React from 'react';
import { observer } from 'mobx-react-lite';

import { useProjectStore } from '../../ProjectStore';
import { Modal } from '../common/Modal';

export const Export: React.FC = observer(() => {
  const projectStore = useProjectStore();

  if (!projectStore.showExport) {
    return null;
  }

  return (
    <Modal title="Export" onDismiss={() => (projectStore.showExport = false)}>
      <div className="actions">
        <button
          onClick={() => projectStore.renderAndSave(0, 'image/jpeg', 0.7)}
        >
          Export JPEG
        </button>
        <button onClick={() => projectStore.renderAndSave(0, 'image/png')}>
          Export PNG
        </button>
      </div>
    </Modal>
  );
});
