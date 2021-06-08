import React, { useCallback, useEffect, useState } from 'react';

import { useProjectStore } from '../../ProjectStore';

export const Drop: React.FC = () => {
  const [dropping, setDropping] = useState(false);
  const projectStore = useProjectStore();

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDropping(false);

      if (e.dataTransfer?.files[0]) {
        const file = e.dataTransfer?.files[0];
        if (file.type.startsWith('image')) {
          projectStore.addProjectFromFile(file);
        }
      }
    },
    [setDropping, projectStore]
  );
  const onDragStart = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDropping(true);
    },
    [setDropping]
  );
  const onDragEnd = useCallback(
    (e: any) => {
      setDropping(false);
    },
    [setDropping]
  );

  useEffect(() => {
    document.body.addEventListener('drop', onDrop);
    document.body.addEventListener('dragover', onDragStart);
    document.body.addEventListener('dragstart', onDragStart);
    document.body.addEventListener('dragleave', onDragEnd);
    document.body.addEventListener('dragexit', onDragEnd);
    document.body.addEventListener('dragend', onDragEnd);

    return () => {
      document.body.removeEventListener('drop', onDrop);
      document.body.removeEventListener('dragover', onDragStart);
      document.body.removeEventListener('dragstart', onDragStart);
      document.body.removeEventListener('dragleave', onDragEnd);
      document.body.removeEventListener('dragexit', onDragEnd);
      document.body.removeEventListener('dragend', onDragEnd);
    };
  }, [onDrop, onDragStart, onDragEnd]);

  if (dropping) {
    <div className="overlay">
      <div className="loading">Drop your image here...</div>
    </div>;
  }

  return null;
};
