import React, { useCallback, useEffect, useRef, useState } from 'react';

import { ClipEditor } from './ClipEditor';
import { CurveEditor } from './CurveEditor';
import { TimeDisplay } from './TimeDisplay';
import { defaultPPS } from './Utils';
import { AutomationLayer } from './types';

const timeHeight = 40;
const layerHeight = 40;
const propertyHeight = 100;
// todo playing/head props

export const Timeline: React.FC = () => {
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
  const [time, setTime] = useState(20);

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
  }, [resize]);

  return (
    <div className="panel timeline-wrapper">
      <div className="timeline">
        <div>
          <div
            className="timeline-info"
            style={{ height: timeHeight + 'px' }}
          ></div>
        </div>
        <div>
          <div ref={resizeDivRef}></div>
          <TimeDisplay
            height={timeHeight}
            minX={minX}
            maxX={maxX}
            pixelsPerSecond={PPS}
            time={time}
            onUpdateTime={setTime}
            onUpdate={(PPS, minX) => {
              setPPS(PPS);
              setMinX(minX);
            }}
          />
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
};
