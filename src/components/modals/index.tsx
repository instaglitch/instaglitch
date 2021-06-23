import React from 'react';
import { observer } from 'mobx-react-lite';

import { useProjectStore } from '../../ProjectStore';
import { FilterGallery } from './FilterGallery';
import { Webcam } from './Webcam';
import { Export } from './Export';
import { About } from './About';
import { Properties } from './Properties';
import { Welcome } from './Welcome';
import { Recording } from './Recording';
import { Error } from './Error';

export const Modals: React.FC = observer(() => {
  const projectStore = useProjectStore();

  if (projectStore.error) {
    return <Error />;
  }

  switch (projectStore.modal) {
    case 'filterGallery':
      return <FilterGallery />;
    case 'webcam':
      return <Webcam />;
    case 'export':
      return <Export />;
    case 'about':
      return <About />;
    case 'properties':
      return <Properties />;
    case 'recording':
      return <Recording />;
  }

  if (projectStore.projects.length === 0) {
    return <Welcome />;
  }

  return null;
});
