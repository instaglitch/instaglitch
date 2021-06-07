import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd';
import { BsEyeFill, BsEyeSlashFill, BsPlus, BsTrash } from 'react-icons/bs';

import { useProjectStore } from '../../ProjectStore';
import { LayerType, Project, TLayer } from '../../types';

function reorder<T>(list: T[], startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
}

const Layer: React.FC<{ project: Project; layer: TLayer }> = observer(
  ({ project, layer }) => {
    const projectStore = useProjectStore();

    return (
      <div
        className={clsx('layer', {
          visible: layer.visible,
          selected: project.selectedLayer === layer.id,
        })}
        onClick={() => (project.selectedLayer = layer.id)}
      >
        <button
          className={clsx('layer-visible-toggle', {
            'lower-opacity': !layer.visible,
          })}
          onClick={() => {
            layer.visible = !layer.visible;
            projectStore.requestPreviewRender();
          }}
        >
          {layer.visible ? <BsEyeFill /> : <BsEyeSlashFill />}
        </button>
        {layer.type === LayerType.IMAGE ? 'Image' : layer.filter.name}
      </div>
    );
  }
);

const LayerList: React.FC = observer(() => {
  const projectStore = useProjectStore();

  const project = projectStore.currentProject;

  if (!project) {
    return null;
  }

  const layers = project.layers;

  return (
    <>
      {layers.map((layer, index) => (
        <Draggable key={layer.id} draggableId={layer.id} index={index}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
            >
              <Layer project={project} layer={layer} />
            </div>
          )}
        </Draggable>
      ))}
    </>
  );
});

export const Layers: React.FC = observer(() => {
  const projectStore = useProjectStore();

  const project = projectStore.currentProject;

  if (!project) {
    return null;
  }

  const currentLayer = project.layers.find(
    layer => layer.id === project.selectedLayer
  );

  const onDragEnd = (result: DropResult) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const layers = reorder(
      project.layers,
      result.source.index,
      result.destination.index
    );

    project.layers = layers;
    projectStore.requestPreviewRender();
  };

  return (
    <div className="subpanel">
      <strong>Layers</strong>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="layers"
            >
              <LayerList />
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <div className="layer-actions">
        <button onClick={() => (projectStore.showFilterGallery = true)}>
          <BsPlus />
        </button>
        <button
          onClick={() => projectStore.removeCurrentLayer()}
          disabled={currentLayer?.type === LayerType.IMAGE}
        >
          <BsTrash />
        </button>
      </div>
    </div>
  );
});
