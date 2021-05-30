import React from 'react';
import { observer } from 'mobx-react-lite';
import { BsCloudUpload } from 'react-icons/bs';

import { useProjectStore } from '../../ProjectStore';
import { Logo } from '../common/Logo';
import { Modal } from '../common/Modal';

export const Welcome: React.FC = observer(() => {
  const projectStore = useProjectStore();

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
          <BsCloudUpload />
          Import from computer
        </button>
      </div>
    </Modal>
  );
});
