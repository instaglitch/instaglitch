import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BsPlayFill, BsPauseFill, BsStopFill } from 'react-icons/bs';
import { observer } from 'mobx-react-lite';

import { useProjectStore } from '../../ProjectStore';
import { ClipEditor } from './ClipEditor';
import { CurveEditor } from './CurveEditor';
import { TimeDisplay } from './TimeDisplay';
import { defaultPPS } from './Utils';
import { AutomationLayer } from './types';

const timeHeight = 40;
const layerHeight = 40;
const propertyHeight = 100;

export const Timeline: React.FC = observer(() => {
  const projectStore = useProjectStore();
  const animated = projectStore.currentProject?.animated;

  const resizeDivRef = useRef<HTMLDivElement>(null);

  const [layers, setLayers] = useState<AutomationLayer[]>([
    {
      id: 'test',
      name: 'Layer 1',
      clips: [
        {
          id: 'clip_1',
          start: 0,
          end: 50,
        },
      ],
      properties: [
        {
          id: 'property_1',
          name: 'Property (float)',
          min: -1,
          max: 1,
          points: [
            {
              id: 'p1',
              x: 0,
              y: 0,
              exponent: 1,
            },
            {
              id: 'p2',
              x: 25,
              y: 0.9,
              exponent: 0.3,
            },
            {
              id: 'p3',
              x: 33,
              y: 0.3,
              exponent: 4,
            },
            {
              id: 'p4',
              x: 50,
              y: -0.1,
              exponent: 0.1,
            },
          ],
        },
        {
          id: 'property_2',
          name: 'Property (bool)',
          min: 0,
          max: 1,
          step: 1,
          isBoolean: true,
          points: [
            {
              id: 'p1',
              x: 0,
              y: 0,
              exponent: 1,
            },
          ],
        },
      ],
    },
  ]);
  const [selectedLayer, setSelectedLayer] = useState<string>();

  const [width, setWidth] = useState(500);
  const [PPS, setPPS] = useState(defaultPPS);
  const [minX, setMinX] = useState(0);
  const maxX = width / PPS + minX;

  const resize = useCallback(() => {
    if (!resizeDivRef.current) {
      return;
    }

    const rect = resizeDivRef.current.getBoundingClientRect();
    setWidth(rect.width);
  }, [setWidth]);

  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);

    return () => window.removeEventListener('resize', resize);
  }, [resize, animated, selectedLayer]);

  useEffect(() => {
    if (!projectStore.currentProject) {
      return;
    }

    const { time, playing } = projectStore.currentProject;
    if (playing) {
      setMinX(minX => {
        if (time > minX + width / 2) {
          return time - width / 2;
        }

        if (time < minX) {
          return time;
        }

        return minX;
      });
    }
  }, [projectStore.currentProject, setMinX, width]);

  if (!animated) {
    return null;
  }

  return (
    <div className="panel timeline-wrapper">
      <div className="playback-controls">
        <button
          onClick={() => {
            if (!projectStore.currentProject!.playing) {
              projectStore.startPlayback();
            } else {
              projectStore.currentProject!.playing = false;
            }
          }}
        >
          {projectStore.currentProject!.playing ? (
            <BsPauseFill />
          ) : (
            <BsPlayFill />
          )}
        </button>
        <button
          onClick={() => {
            projectStore.currentProject!.playing = false;
            projectStore.currentProject!.time = 0;
          }}
        >
          <BsStopFill />
        </button>
      </div>
      <div className="timeline">
        <div style={{ height: timeHeight + 'px' }}>
          <div
            className="timeline-info"
            style={{ height: timeHeight + 'px' }}
          ></div>
        </div>
        <TimeDisplay
          height={timeHeight}
          minX={minX}
          maxX={maxX}
          pixelsPerSecond={PPS}
          time={projectStore.currentProject!.time}
          onUpdateTime={time => (projectStore.currentProject!.time = time)}
          onUpdate={(PPS, minX) => {
            setPPS(PPS);
            setMinX(minX);
          }}
        />
        <div></div>
        <div>
          <div ref={resizeDivRef}></div>
        </div>
        {layers.map(layer => (
          <React.Fragment key={layer.id}>
            <div>
              <div
                className="timeline-info timeline-info-layer"
                style={{ height: layerHeight + 'px' }}
                onClick={() =>
                  setSelectedLayer(id =>
                    id === layer.id ? undefined : layer.id
                  )
                }
              >
                <span>{layer.name}</span>
              </div>
              {selectedLayer === layer.id &&
                layer.properties.map(property => (
                  <div
                    className="timeline-info timeline-info-property"
                    style={{ height: propertyHeight + 'px' }}
                    key={property.id}
                  >
                    <span>{property.name}</span>
                  </div>
                ))}
            </div>
            <div>
              <ClipEditor
                height={layerHeight}
                minX={minX}
                maxX={maxX}
                pixelsPerSecond={PPS}
                clips={layer.clips}
                onChange={clips => {
                  setLayers(layers => {
                    layer.clips = clips;
                    return [...layers];
                  });
                }}
              />
              {selectedLayer === layer.id &&
                layer.properties.map(property => (
                  <CurveEditor
                    key={property.id}
                    height={propertyHeight}
                    minX={minX}
                    maxX={maxX}
                    pixelsPerSecond={PPS}
                    minY={property.min}
                    maxY={property.max}
                    step={property.step}
                    isBoolean={property.isBoolean}
                    points={property.points}
                    onChange={points => {
                      setLayers(layers => {
                        property.points = points;
                        return [...layers];
                      });
                    }}
                  />
                ))}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
});
