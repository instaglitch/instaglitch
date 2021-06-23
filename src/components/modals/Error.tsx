import React from 'react';
import { observer } from 'mobx-react-lite';

import { useProjectStore } from '../../ProjectStore';
import { Modal } from '../common/Modal';

export const Error: React.FC = observer(() => {
  const projectStore = useProjectStore();

  return (
    <Modal title="Error" onDismiss={() => (projectStore.error = undefined)}>
      <div className="info">{projectStore.error}</div>
      <div className="action">
        <button onClick={() => (projectStore.error = undefined)}>Ok</button>
      </div>
    </Modal>
  );
});
