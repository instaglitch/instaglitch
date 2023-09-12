import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';

import { projectStore } from '../../stores/ProjectStore';

export const PreviewCanvas: React.FC = observer(() => {
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
