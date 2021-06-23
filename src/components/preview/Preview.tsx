import React, { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';

import { useProjectStore } from '../../ProjectStore';
import { FilterSettingType, LayerType, FilterLayer } from '../../types';
import { PreviewCanvas } from './PreviewCanvas';
import { disable, enable } from '../../scrollLock';

export const Preview: React.FC = observer(() => {
  const projectStore = useProjectStore();
  const project = projectStore.currentProject;

  const [moving, setMoving] = useState<string>();
  const initialPositionRef = useRef<[number, number]>();
  const initialValueRef = useRef<[number, number]>();

  const layer = project?.layers.find(
    layer => layer.id === project.selectedLayer
  );

  useEffect(() => {
    if (!moving) {
      return;
    }

    const move = (clientX: number, clientY: number) => {
      if (!initialPositionRef.current || !initialValueRef.current) {
        return;
      }

      const [x, y] = initialPositionRef.current;
      const [valueX, valueY] = initialValueRef.current;

      const { width, height } = projectStore.canvas.getBoundingClientRect();

      const initialCanvasX = width * (valueX + 0.5);
      const initialCanvasY = height * (valueY + 0.5);

      const canvasClientX = x - initialCanvasX;
      const canvasClientY = y - initialCanvasY;

      const newCanvasX = clientX - canvasClientX;
      const newCanvasY = clientY - canvasClientY;

      const newValueX = newCanvasX / width - 0.5;
      const newValueY = newCanvasY / height - 0.5;

      (layer as FilterLayer).settings[moving] = [newValueX, newValueY];
      projectStore.requestPreviewRender();
    };

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      move(e.clientX, e.clientY);
    };
    const handleUp = () => {
      disable();
      setMoving(undefined);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const touch = e.touches[0];
      if (!touch) {
        return;
      }

      move(touch.clientX, touch.clientY);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleUp);

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleUp);
    document.addEventListener('touchcancel', handleUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleUp);

      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleUp);
      document.removeEventListener('touchcancel', handleUp);
    };
  }, [moving, layer, projectStore, setMoving]);

  if (!layer) {
    return null;
  }

  const renderOffsetMarks = () => {
    if (layer?.type !== LayerType.FILTER || !layer.filter.settings) {
      return null;
    }

    const offsetSettings = layer.filter.settings.filter(
      setting => setting.type === FilterSettingType.OFFSET
    );
    if (offsetSettings.length === 0) {
      return null;
    }

    return offsetSettings.map(setting => {
      const [x, y] = layer.settings[setting.key];

      return (
        <div
          key={setting.key}
          className="offset-mark"
          onMouseDown={e => {
            e.preventDefault();
            e.stopPropagation();

            initialPositionRef.current = [e.clientX, e.clientY];
            initialValueRef.current = [x, y];

            setMoving(setting.key);
          }}
          onTouchStart={e => {
            const touch = e.touches[0];
            if (!touch) {
              return;
            }

            enable();
            e.preventDefault();
            e.stopPropagation();

            initialPositionRef.current = [touch.clientX, touch.clientY];
            initialValueRef.current = [x, y];

            setMoving(setting.key);
          }}
          style={{
            backgroundColor: setting.color,
            top: (y + 0.5) * 100 + '%',
            left: (x + 0.5) * 100 + '%',
          }}
        />
      );
    });
  };

  return (
    <div
      className={clsx('preview-wrap', { 'animation-open': project?.animated })}
    >
      {renderOffsetMarks()}
      <PreviewCanvas />
    </div>
  );
});
