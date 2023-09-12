import React from 'react';
import { observer } from 'mobx-react-lite';

import { projectStore } from '../../ProjectStore';

export const Loading: React.FC = observer(() => {
  if (!projectStore.currentProject?.loading) {
    return null;
  }

  return (
    <div className="overlay">
      <div className="loading">Please wait...</div>
    </div>
  );
});
