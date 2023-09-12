import React from 'react';
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
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BsX } from 'react-icons/bs';

import { projectStore } from '../../ProjectStore';
import { truncate } from '../../Utils';
import { Project } from '../../Project';

const Tab: React.FC<{ project: Project }> = observer(({ project }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      className={clsx('tab', {
        selected: projectStore.currentProjectId === project.id,
      })}
      onClick={() => {
        projectStore.currentProjectId = project.id;
        projectStore.renderCurrentProject();
      }}
      title={project.filename}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      {truncate(project.filename)}
      <button
        onClick={e => {
          e.stopPropagation();
          projectStore.closeProject(project.id);
        }}
      >
        <BsX />
      </button>
    </div>
  );
});

const activationConstraint = {
  distance: 15,
};

export const Tabs: React.FC = observer(() => {
  const projects = projectStore.projects;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint }),
    useSensor(TouchSensor, { activationConstraint }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (projects.length === 0) {
    return null;
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = projectStore.projects.findIndex(
        project => project.id === active.id
      );
      const newIndex = projectStore.projects.findIndex(
        project => project.id === over.id
      );

      projectStore.projects = arrayMove(
        projectStore.projects,
        oldIndex,
        newIndex
      );
    }
  }

  return (
    <div className="panel tabs">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={projects}
          strategy={horizontalListSortingStrategy}
        >
          {projects.map(project => (
            <Tab key={project.id} project={project} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
});
