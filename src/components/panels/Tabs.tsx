import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd';
import { BsX } from 'react-icons/bs';

import { useProjectStore } from '../../ProjectStore';
import { Project } from '../../types';

function reorder<T>(list: T[], startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
}

const truncate = (str: string) => {
  const maxLength = 25;

  if (str.length < maxLength) {
    return str;
  }

  const split = str.split('.');
  if (split.length < 0) {
    return '';
  }

  let extension = split.pop() as string;
  const name = split.join('.');
  if (extension.length > 4) {
    extension = 'jpg';
  }

  if (name.length > maxLength - 5) {
    const maxPartLength = Math.floor((maxLength - 5) / 2);

    return (
      name.substr(0, maxPartLength) +
      '...' +
      name.substr(name.length - maxPartLength) +
      '.' +
      extension
    );
  }
};

const Tab: React.FC<{ project: Project }> = observer(({ project }) => {
  const projectStore = useProjectStore();

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

const TabList: React.FC = observer(() => {
  const projectStore = useProjectStore();
  const projects = projectStore.projects;

  if (projects.length === 0) {
    return null;
  }

  return (
    <>
      {projects.map((project, index) => (
        <Draggable key={project.id} draggableId={project.id} index={index}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
            >
              <Tab project={project} />
            </div>
          )}
        </Draggable>
      ))}
    </>
  );
});

export const Tabs: React.FC = observer(() => {
  const projectStore = useProjectStore();
  const projects = projectStore.projects;

  if (projects.length === 0) {
    return null;
  }

  const onDragEnd = (result: DropResult) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = reorder(
      projects,
      result.source.index,
      result.destination.index
    );

    projectStore.projects = items;
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable" direction="horizontal">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="panel tabs"
          >
            <TabList />
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
});
