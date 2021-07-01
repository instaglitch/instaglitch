import React from 'react';
import { observer } from 'mobx-react-lite';
import { VarUI, VarCategory, VarSlider } from 'react-var-ui';
import { toJS } from 'mobx';

import { useProjectStore } from '../../ProjectStore';
import { Modal } from '../common/Modal';

export const Recording: React.FC = observer(() => {
  const projectStore = useProjectStore();

  return (
    <Modal title="Recording" onDismiss={() => (projectStore.modal = undefined)}>
      <div className="info">
        <VarUI
          values={toJS(projectStore.recordingSettings)}
          updateValues={data => (projectStore.recordingSettings = data)}
        >
          <VarCategory label="Export settings">
            <VarSlider
              path="start"
              min={0}
              max={projectStore.maxClipEnd - 5}
              step={0.1}
              label="Start (seconds)"
            />
            <VarSlider
              path="duration"
              min={5}
              max={
                projectStore.maxClipEnd - projectStore.recordingSettings.start
              }
              step={0.1}
              label="Duration (seconds)"
            />
          </VarCategory>
        </VarUI>
      </div>
      <div className="actions">
        <button onClick={() => (projectStore.modal = undefined)}>Cancel</button>
        <button onClick={() => projectStore.recordVideo()}>
          Start recording
        </button>
      </div>
    </Modal>
  );
});
