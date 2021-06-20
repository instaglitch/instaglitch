import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  BsPlayFill,
  BsPauseFill,
  BsStopFill,
  BsFillCaretDownFill,
  BsFillCaretLeftFill,
} from 'react-icons/bs';
import { observer } from 'mobx-react-lite';

import { useProjectStore } from '../../ProjectStore';
import { FilterSettingType, LayerType } from '../../types';
import { ClipEditor } from './ClipEditor';
import { CurveEditor } from './CurveEditor';
import { TimeDisplay } from './TimeDisplay';
import { defaultPPS } from './Utils';
import { layerName } from '../../Utils';
import { TimeBackground } from './TimeBackground';

const timeHeight = 40;
const layerHeight = 40;
const propertyHeight = 100;

const supportedTypes = [
  FilterSettingType.FLOAT,
  FilterSettingType.INTEGER,
  FilterSettingType.ANGLE,
  FilterSettingType.OFFSET,
];

export const Timeline: React.FC = observer(() => {
  const projectStore = useProjectStore();
  const currentProject = projectStore.currentProject;
  const animated = currentProject?.animated;

  const resizeDivRef = useRef<HTMLDivElement>(null);

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

  if (!currentProject || !animated) {
    return null;
  }

  return (
    <div className="panel timeline-wrapper">
      <div className="playback-controls">
        <button
          onClick={() => {
            if (!currentProject.playing) {
              projectStore.startPlayback();
            } else {
              currentProject.playing = false;
            }
          }}
        >
          {currentProject.playing ? <BsPauseFill /> : <BsPlayFill />}
        </button>
        <button
          onClick={() => {
            currentProject.playing = false;
            currentProject.time = 0;
          }}
        >
          <BsStopFill />
        </button>
        <button onClick={() => projectStore.recordVideo()}>Record (10s)</button>
      </div>
      <div className="timeline" style={{ minHeight: timeHeight + 'px' }}>
        <div style={{ height: timeHeight + 'px' }}>
          <div
            className="timeline-info"
            style={{ height: timeHeight + 'px' }}
          ></div>
        </div>
        <div style={{ height: timeHeight + 'px' }}>
          <div ref={resizeDivRef}></div>
          <TimeDisplay
            height={timeHeight}
            minX={minX}
            maxX={maxX}
            pixelsPerSecond={PPS}
            time={currentProject.time}
            onUpdateTime={time => {
              currentProject.time = time;
              projectStore.requestPreviewRender();
            }}
            onUpdate={(PPS, minX) => {
              setPPS(PPS);
              setMinX(minX);
            }}
          />
        </div>
      </div>
      <div className="timeline-with-background">
        <div className="timeline">
          {currentProject.layers.map(layer => (
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
                  <span>{layerName(layer)}</span>
                  {selectedLayer === layer.id ? (
                    <BsFillCaretDownFill />
                  ) : (
                    <BsFillCaretLeftFill />
                  )}
                </div>
                {selectedLayer === layer.id &&
                  layer.type === LayerType.FILTER &&
                  layer.filter.settings?.map(setting => {
                    if (!supportedTypes.includes(setting.type)) {
                      return null;
                    }

                    if (setting.type === FilterSettingType.OFFSET) {
                      return (
                        <React.Fragment key={setting.key}>
                          <div
                            className="timeline-info timeline-info-property"
                            style={{ height: propertyHeight + 'px' }}
                            key={setting.key}
                          >
                            <span>{setting.name} (X)</span>
                          </div>
                          <div
                            className="timeline-info timeline-info-property"
                            style={{ height: propertyHeight + 'px' }}
                            key={setting.key}
                          >
                            <span>{setting.name} (Y)</span>
                          </div>
                        </React.Fragment>
                      );
                    }

                    return (
                      <div
                        className="timeline-info timeline-info-property"
                        style={{ height: propertyHeight + 'px' }}
                        key={setting.key}
                      >
                        <span>{setting.name}</span>
                      </div>
                    );
                  })}
              </div>
              <div>
                <ClipEditor
                  height={layerHeight}
                  minX={minX}
                  maxX={maxX}
                  pixelsPerSecond={PPS}
                  clips={currentProject.clips[layer.id] ?? []}
                  onChange={clips => {
                    currentProject.clips[layer.id] = [...clips];
                    projectStore.requestPreviewRender();
                  }}
                />
                {selectedLayer === layer.id &&
                  layer.type === LayerType.FILTER &&
                  layer.filter.settings?.map(setting => {
                    if (!supportedTypes.includes(setting.type)) {
                      return null;
                    }

                    if (setting.type === FilterSettingType.OFFSET) {
                      return (
                        <React.Fragment key={setting.key}>
                          <CurveEditor
                            key={setting.key}
                            height={propertyHeight}
                            minX={minX}
                            maxX={maxX}
                            pixelsPerSecond={PPS}
                            minY={-1}
                            maxY={1}
                            previewValue={layer.settings[setting.key][0]}
                            points={
                              currentProject.points[layer.id]?.[
                                setting.key + '_x'
                              ] ?? []
                            }
                            onChange={points => {
                              if (!currentProject.points[layer.id]) {
                                currentProject.points[layer.id] = {};
                              }

                              currentProject.points[layer.id][
                                setting.key + '_x'
                              ] = points;
                              projectStore.requestPreviewRender();
                            }}
                          />
                          <CurveEditor
                            key={setting.key}
                            height={propertyHeight}
                            minX={minX}
                            maxX={maxX}
                            pixelsPerSecond={PPS}
                            minY={-1}
                            maxY={1}
                            previewValue={layer.settings[setting.key][1]}
                            points={
                              currentProject.points[layer.id]?.[
                                setting.key + '_y'
                              ] ?? []
                            }
                            onChange={points => {
                              if (!currentProject.points[layer.id]) {
                                currentProject.points[layer.id] = {};
                              }

                              currentProject.points[layer.id][
                                setting.key + '_y'
                              ] = points;
                              projectStore.requestPreviewRender();
                            }}
                          />
                        </React.Fragment>
                      );
                    }

                    const minValue =
                      setting.type === FilterSettingType.ANGLE
                        ? 0
                        : setting.minValue!;
                    const maxValue =
                      setting.type === FilterSettingType.ANGLE
                        ? Math.PI * 2
                        : setting.maxValue!;
                    const step =
                      setting.type === FilterSettingType.INTEGER
                        ? 1
                        : undefined;

                    return (
                      <CurveEditor
                        key={setting.key}
                        height={propertyHeight}
                        minX={minX}
                        maxX={maxX}
                        pixelsPerSecond={PPS}
                        minY={minValue}
                        maxY={maxValue}
                        step={step}
                        previewValue={layer.settings[setting.key]}
                        points={
                          currentProject.points[layer.id]?.[setting.key] ?? []
                        }
                        onChange={points => {
                          if (!currentProject.points[layer.id]) {
                            currentProject.points[layer.id] = {};
                          }

                          currentProject.points[layer.id][setting.key] = points;
                          projectStore.requestPreviewRender();
                        }}
                      />
                    );
                  })}
              </div>
            </React.Fragment>
          ))}
        </div>
        <TimeBackground
          height={timeHeight}
          minX={minX}
          maxX={maxX}
          pixelsPerSecond={PPS}
          time={currentProject.time}
        />
      </div>
    </div>
  );
});
