import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  UniqueIdentifier,
  DragStartEvent,
  DragMoveEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  BsEyeFill,
  BsEyeSlashFill,
  BsPlus,
  BsTrash,
  BsImage,
  BsFolder2,
  BsFolder2Open,
} from 'react-icons/bs';

import { FileInputMode, useProjectStore } from '../../ProjectStore';
import { LayerType, Project, TLayer } from '../../types';
import { layerName, truncate } from '../../Utils';
import { createPortal } from 'react-dom';

const Layer: React.FC<{
  project: Project;
  layer: TLayer;
  isClone?: boolean;
  isGhost?: boolean;
  depth?: number;
  projectedDepth?: number;
}> = observer(({ project, layer, isClone, isGhost, depth, projectedDepth }) => {
  const projectStore = useProjectStore();
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: layer.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    '--depth': depth,
  };

  const name = layerName(layer);
  return (
    <div
      className={clsx('layer', {
        visible: layer.visible,
        selected: project.selectedLayer === layer.id,
        clone: isClone,
        ghost: isGhost,
      })}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => (project.selectedLayer = layer.id)}
      onDoubleClick={() => {
        if (layer.type === LayerType.GROUP) {
          layer.isCollapsed = !layer.isCollapsed;
        }
      }}
    >
      {isGhost && (
        <div
          className="layer-indicator"
          style={{ '--depth': projectedDepth } as any}
        ></div>
      )}
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
      {layer.type === LayerType.SOURCE && <BsImage />}
      {layer.type === LayerType.GROUP &&
        (layer.isCollapsed ? <BsFolder2 /> : <BsFolder2Open />)}
      <span title={name}>{truncate(name)}</span>
    </div>
  );
});

const activationConstraint = {
  distance: 15,
};

type TreeLayer = TLayer & {
  depth?: number;
};

export const Layers: React.FC = observer(() => {
  const projectStore = useProjectStore();

  const project = projectStore.currentProject;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint }),
    useSensor(TouchSensor, { activationConstraint }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [activeId, setActiveId] = useState<UniqueIdentifier>();
  const [overId, setOverId] = useState<UniqueIdentifier>();
  const [offsetLeft, setOffsetLeft] = useState(0);

  const visibleItems: TreeLayer[] = [];
  const skipIds: Set<UniqueIdentifier> = new Set();

  function handleItem(layer: TreeLayer, isHidden = false) {
    if (skipIds.has(layer.id)) {
      return;
    }

    skipIds.add(layer.id);

    if (!isHidden) {
      visibleItems.push(layer);
    }

    if (layer.type === LayerType.GROUP) {
      const children = projectStore.currentProject!.layers.filter(
        item => item.parentId === layer.id
      );
      for (const child of children) {
        if (skipIds.has(child.id)) {
          continue;
        }

        handleItem(
          { ...child, parentId: layer.id, depth: (layer.depth || 0) + 1 }
          // layer.isCollapsed || isHidden
        );
      }
    }
  }

  if (!project) {
    return null;
  }

  for (const layer of projectStore.currentProject.layers.filter(
    layer => !layer.parentId
  )) {
    handleItem(layer);
  }

  let projectedParentId: string | number | undefined = undefined;
  let projectedDepth: number = 0;
  if (offsetLeft > 0) {
    const overItemIndex = visibleItems.findIndex(({ id }) => id === overId);
    const activeItemIndex = visibleItems.findIndex(({ id }) => id === activeId);
    const newOrder = arrayMove(visibleItems, activeItemIndex, overItemIndex);
    const previousItem = newOrder[overItemIndex - 1];

    if (previousItem) {
      if (previousItem.type === LayerType.GROUP && !previousItem.isCollapsed) {
        projectedDepth = (previousItem.depth || 0) + 1;
        projectedParentId = previousItem.id;
      } else if (previousItem.parentId) {
        projectedDepth = previousItem.depth || 0;
        projectedParentId = previousItem.parentId;
      }
    }
  }

  function resetState() {
    setOverId(undefined);
    setActiveId(undefined);
    setOffsetLeft(0);
    document.body.style.setProperty('cursor', '');
  }

  function handleDragStart({ active: { id: activeId } }: DragStartEvent) {
    setActiveId(activeId);
    setOverId(activeId);
    document.body.style.setProperty('cursor', 'grabbing');
  }

  function handleDragMove({ delta }: DragMoveEvent) {
    setOffsetLeft(delta.x);
  }

  function handleDragOver({ over }: DragOverEvent) {
    setOverId(over?.id);
  }

  function handleDragCancel() {
    resetState();
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    resetState();

    const oldIndex = visibleItems.findIndex(item => item.id === active.id);
    const newIndex = visibleItems.findIndex(item => item.id === over?.id);
    const newOrder = arrayMove(visibleItems, oldIndex, newIndex);

    for (const item of newOrder) {
      if (item.id === active.id) {
        const parent = visibleItems.find(item => item.id === projectedParentId);

        if (parent) {
          item.parentId = projectedParentId as any;
        } else {
          item.parentId = undefined;
        }
      }
    }

    project!.layers = newOrder;
    projectStore.requestPreviewRender();
  }

  const activeItem = activeId
    ? visibleItems.find(({ id }) => id === activeId)
    : null;

  return (
    <div className="subpanel">
      <strong>Layers</strong>
      <div className="layers">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext
            items={visibleItems}
            strategy={verticalListSortingStrategy}
          >
            {visibleItems.map(currentItem => (
              <Layer
                key={currentItem.id}
                project={project}
                layer={currentItem}
                isGhost={currentItem.id === activeId}
                depth={currentItem.depth || 0}
                projectedDepth={projectedDepth}
              />
            ))}
            {createPortal(
              <DragOverlay>
                {activeId && activeItem ? (
                  <Layer project={project} layer={activeItem} isClone />
                ) : null}
              </DragOverlay>,
              document.body
            )}
          </SortableContext>
        </DndContext>
      </div>
      <div className="layer-actions">
        <button onClick={() => (projectStore.modal = 'filterGallery')}>
          <BsPlus />
          <span>Filter</span>
        </button>
        <button onClick={() => projectStore.openFilePicker(FileInputMode.ADD)}>
          <BsPlus />
          <span>File</span>
        </button>
        <button onClick={() => projectStore.addGroup()}>
          <BsPlus />
          <span>Group</span>
        </button>
        <button onClick={() => projectStore.removeCurrentLayer()}>
          <BsTrash />
          <span>Delete layer</span>
        </button>
      </div>
    </div>
  );
});
