import React, { useMemo } from 'react';
import { observer } from 'mobx-react-lite';

import { useProjectStore } from '../../ProjectStore';

export const Recording: React.FC = observer(() => {
  const projectStore = useProjectStore();

  const time = projectStore.currentProject?.time;
  const { start, duration } = projectStore.recordingSettings;

  const percentDone = useMemo(() => {
    if (!time) {
      return 0;
    }

    if (duration === 0) {
      return 0;
    }

    return ((time - start) / duration) * 100;
  }, [time, start, duration]);

  if (!projectStore.recording) {
    return null;
  }

  return (
    <div className="overlay">
      <div className="recording">
        <div>Video recording in progress...</div>
        <div>
          <strong>
            Do not navigate away from this site or your recording will contain
            errors.
          </strong>
        </div>
        <div className="progressbar">
          <div
            className="progressbar-inside"
            style={{ width: percentDone + '%' }}
          ></div>
        </div>
        <div>
          {percentDone.toFixed(2)}% ({((time || 0) - start).toFixed(2)} seconds
          out of {duration.toFixed(2)} seconds)
        </div>
        <div>
          <button onClick={() => (projectStore.recordingCancel = true)}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
});
