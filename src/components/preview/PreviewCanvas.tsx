import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';

import { useProjectStore } from '../../ProjectStore';

export const PreviewCanvas: React.FC = observer(() => {
  const projectStore = useProjectStore();

  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!divRef.current) {
      return;
    }

    const div = divRef.current;
    div.textContent = '';

    if (projectStore.canvas) {
      div.append(projectStore.canvas);
    }
  }, [projectStore.canvas]);

  return <div ref={divRef} />;
});
