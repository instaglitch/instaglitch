import React from 'react';
import { observer } from 'mobx-react-lite';
import { BsBoxArrowInUp, BsCamera } from 'react-icons/bs';

import { projectStore } from '../../stores/ProjectStore';
import { Logo } from '../common/Logo';
import { Modal } from '../common/Modal';

export const Welcome: React.FC = observer(() => {
  if (projectStore.projects.length > 0) {
    return null;
  }

  return (
    <Modal title={<Logo />}>
      <div className="info">
        Welcome to Instaglitch. Please choose from one of the available actions
        to continue.
      </div>
      <div className="actions">
        <button onClick={() => projectStore.openFilePicker()}>
          <BsBoxArrowInUp />
          <span>Import file</span>
        </button>
        <button onClick={() => (projectStore.modal = 'webcam')}>
          <BsCamera />
          <span>Webcam</span>
        </button>
      </div>
    </Modal>
  );
});
