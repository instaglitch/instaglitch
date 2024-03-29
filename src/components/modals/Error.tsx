import React from 'react';
import { observer } from 'mobx-react-lite';

import { projectStore } from '../../stores/ProjectStore';
import { Modal } from '../common/Modal';

export const Error: React.FC = observer(() => {
  return (
    <Modal title="Error" onDismiss={() => (projectStore.error = undefined)}>
      <div className="info">{projectStore.error}</div>
      <div className="action">
        <button onClick={() => (projectStore.error = undefined)}>Ok</button>
      </div>
    </Modal>
  );
});
