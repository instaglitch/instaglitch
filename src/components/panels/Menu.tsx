import React from 'react';
import { observer } from 'mobx-react-lite';

import { useProjectStore } from '../../ProjectStore';
import { Logo } from '../common/Logo';

export const Menu: React.FC = observer(() => {
  const projectStore = useProjectStore();

  return (
    <ul className="panel menu">
      <Logo />
      <li>
        <button onClick={() => projectStore.openFilePicker()}>Open</button>
      </li>
      <li>
        <button onClick={() => (projectStore.showExport = true)}>Export</button>
      </li>
      <li>
        <button onClick={() => (projectStore.showAbout = true)}>About</button>
      </li>
    </ul>
  );
});
