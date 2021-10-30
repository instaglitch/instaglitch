import React from 'react';
import { observer } from 'mobx-react-lite';

import { useProjectStore } from '../../ProjectStore';
import { Logo } from '../common/Logo';
import { Modal } from '../common/Modal';

export const About: React.FC = observer(() => {
  const projectStore = useProjectStore();

  return (
    <Modal title={<Logo />} onDismiss={() => (projectStore.modal = undefined)}>
      <div className="info">Instaglitch Beta.</div>
      <div className="info">
        Source code:{' '}
        <a href="https://github.com/instaglitch/instaglitch">GitHub</a>.{' '}
        <a href="https://twitter.com/matsz_dev">
          Follow me on Twitter for updates.
        </a>
      </div>
    </Modal>
  );
});
