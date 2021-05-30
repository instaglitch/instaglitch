import React from 'react';
import { observer } from 'mobx-react-lite';

import { useProjectStore } from '../../ProjectStore';
import { Logo } from '../common/Logo';
import { Modal } from '../common/Modal';

export const About: React.FC = observer(() => {
  const projectStore = useProjectStore();

  if (!projectStore.showAbout) {
    return null;
  }

  return (
    <Modal title={<Logo />} onDismiss={() => (projectStore.showAbout = false)}>
      <div className="info">Instaglitch Beta.</div>
      <div className="info">(c) 2021. All copyright reserved.</div>
    </Modal>
  );
});
