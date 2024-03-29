import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  BsBoxArrowInUp,
  BsCamera,
  BsDownload,
  BsClipboard,
  BsInfoSquare,
  BsFillGearFill,
} from 'react-icons/bs';

import { projectStore } from '../../stores/ProjectStore';
import { Logo } from '../common/Logo';

const copyToClipboardAvailable = 'ClipboardItem' in window;

export const Menu: React.FC = observer(() => {
  return (
    <ul className="panel menu">
      <Logo />
      <li>
        <button onClick={() => projectStore.openFilePicker()}>
          <BsBoxArrowInUp />
          <span>Open</span>
        </button>
      </li>
      <li>
        <button onClick={() => (projectStore.modal = 'webcam')}>
          <BsCamera />
          <span>Webcam</span>
        </button>
      </li>
      <li>
        <button onClick={() => (projectStore.modal = 'export')}>
          <BsDownload />
          <span>Export</span>
        </button>
      </li>
      {copyToClipboardAvailable && (
        <li>
          <button onClick={() => projectStore.copyToClipboard()}>
            <BsClipboard />
            <span>Copy to clipboard</span>
          </button>
        </li>
      )}
      <li>
        <button onClick={() => (projectStore.modal = 'properties')}>
          <BsFillGearFill />
          <span>Properties</span>
        </button>
      </li>
      <li>
        <button onClick={() => (projectStore.modal = 'about')}>
          <BsInfoSquare />
          <span>About</span>
        </button>
      </li>
    </ul>
  );
});
