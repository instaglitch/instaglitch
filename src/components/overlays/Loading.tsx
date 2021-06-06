import React from 'react';
import { observer } from 'mobx-react-lite';

import { useProjectStore } from '../../ProjectStore';

export const Loading: React.FC = observer(() => {
  const projectStore = useProjectStore();

  if (!projectStore.loading) {
    return null;
  }

  return (
    <div className="overlay">
      <div className="loading">Please wait...</div>
    </div>
  );
});
