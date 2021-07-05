import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  BsPlayFill,
  BsPauseFill,
  BsStopFill,
  BsFillCaretDownFill,
  BsFillCaretLeftFill,
} from 'react-icons/bs';
import { ScrollArea } from 'react-nano-scrollbar';
import { observer } from 'mobx-react-lite';

import { useProjectStore } from '../../ProjectStore';
import { FilterSettingType, LayerType } from '../../types';
import { ClipEditor } from './ClipEditor';
import { CurveEditor } from './CurveEditor';
import { TimeDisplay } from './TimeDisplay';
import { defaultPPS } from './Utils';
import { layerName, supportsMediaRecorder, truncate } from '../../Utils';
import { TimeBackground } from './TimeBackground';
import { sourceSettings } from '../../sourceSettings';
import { TimelineItem } from './TimelineItem';
import { ITimelineContext, TimelineContext } from './TimelineContext';

const canRecord = supportsMediaRecorder();

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
  const time = currentProject?.time;
  const playing = currentProject?.playing;

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

  const togglePlayback = useCallback(
    () => projectStore.togglePlayback(),
    [projectStore]
  );

  const contextValue = useMemo<ITimelineContext>(
    () => ({
      minX,
      maxX,
      setMinX,
      time: time ?? 0,
      setTime: time => projectStore.setTime(time),
      PPS,
      setPPS,
    }),
    [minX, maxX, setMinX, time, projectStore, PPS, setPPS]
  );

  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);

    const keyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        togglePlayback();
      }
    };

    if (animated) {
      window.addEventListener('keyup', keyUp);
    }

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('keyup', keyUp);
    };
  }, [resize, animated, selectedLayer, togglePlayback]);

  useEffect(() => {
    if (playing && typeof time !== 'undefined') {
      setMinX(minX => {
        const maxX = width / PPS + minX;
        if (time > minX + (maxX - minX) / 2) {
          return time - (maxX - minX) / 2;
        }

        if (time < minX) {
          return time;
        }

        return minX;
      });
    }
  }, [time, playing, setMinX, width, PPS]);

  if (!currentProject || !animated) {
    return null;
  }

  return (
    <TimelineContext.Provider value={contextValue}>
      <div className="panel timeline-wrapper">
        <div className="playback-controls">
          <button onClick={togglePlayback}>
            {currentProject.playing ? <BsPauseFill /> : <BsPlayFill />}
          </button>
          <button
            onClick={() => {
              projectStore.stopPlayback();
              projectStore.setTime(0);
            }}
          >
            <BsStopFill />
          </button>
          {canRecord && (
            <button onClick={() => (projectStore.modal = 'recording')}>
              Record
            </button>
          )}
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
            <TimeDisplay height={timeHeight} />
          </div>
        </div>
        <ScrollArea className="timeline-with-background">
          <div className="timeline">
            {currentProject.layers.map(layer => {
              const settings =
                layer.type === LayerType.SOURCE
                  ? sourceSettings
                  : layer.filter.settings;
              const name = layerName(layer);

              return (
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
                      <span title={name}>{truncate(name, 16)}</span>
                      {selectedLayer === layer.id ? (
                        <BsFillCaretDownFill />
                      ) : (
                        <BsFillCaretLeftFill />
                      )}
                    </div>
                    {selectedLayer === layer.id &&
                      settings?.map(setting => {
                        if (!supportedTypes.includes(setting.type)) {
                          return null;
                        }

                        if (setting.type === FilterSettingType.OFFSET) {
                          return (
                            <React.Fragment key={setting.key}>
                              <div
                                className="timeline-info timeline-info-property"
                                style={{ height: propertyHeight + 'px' }}
                              >
                                <span>{setting.name} (X)</span>
                              </div>
                              <div
                                className="timeline-info timeline-info-property"
                                style={{ height: propertyHeight + 'px' }}
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
                    <TimelineItem height={layerHeight}>
                      <ClipEditor
                        height={layerHeight}
                        clips={currentProject.clips[layer.id] ?? []}
                        onChange={clips => {
                          currentProject.clips[layer.id] = [...clips];
                          projectStore.requestPreviewRender();
                        }}
                      />
                    </TimelineItem>
                    {selectedLayer === layer.id &&
                      settings?.map(setting => {
                        if (!supportedTypes.includes(setting.type)) {
                          return null;
                        }

                        if (setting.type === FilterSettingType.OFFSET) {
                          return (
                            <React.Fragment key={setting.key}>
                              <TimelineItem height={propertyHeight}>
                                <CurveEditor
                                  height={propertyHeight}
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
                              </TimelineItem>
                              <TimelineItem height={propertyHeight}>
                                <CurveEditor
                                  height={propertyHeight}
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
                              </TimelineItem>
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
                          <TimelineItem
                            height={propertyHeight}
                            key={setting.key}
                          >
                            <CurveEditor
                              height={propertyHeight}
                              minY={minValue}
                              maxY={maxValue}
                              step={step}
                              previewValue={layer.settings[setting.key]}
                              points={
                                currentProject.points[layer.id]?.[
                                  setting.key
                                ] ?? []
                              }
                              onChange={points => {
                                if (!currentProject.points[layer.id]) {
                                  currentProject.points[layer.id] = {};
                                }

                                currentProject.points[layer.id][setting.key] =
                                  points;
                                projectStore.requestPreviewRender();
                              }}
                            />
                          </TimelineItem>
                        );
                      })}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
          <TimeBackground height={timeHeight} />
        </ScrollArea>
      </div>
    </TimelineContext.Provider>
  );
});
