import { makeAutoObservable } from 'mobx';
import { v4 as uuid, v4 } from 'uuid';
import { glueIsSourceLoaded, glueGetSourceDimensions } from 'fxglue';

import {
  Filter,
  FilterSettingType,
  SourceLayer,
  LayerType,
  TLayer,
  FilterSetting,
  AutomationPoint,
  AutomationClip,
} from '../types';
import {
  createFilterLayer,
  createGroupLayer,
  createSourceLayer,
} from '../filters/functions';
import { getY } from '../components/timeline/Utils';

function createSource(url: string, type: 'image' | 'video') {
  const source =
    type === 'image' ? new Image() : document.createElement('video');
  source.src = url;
  if (source instanceof HTMLVideoElement) {
    source.playsInline = true;
    source.preload = 'metadata';
    source.crossOrigin = 'anonymous';
  }

  return source;
}

export interface RecordingSettings {
  start: number;
  duration: number;
  videoBitrate: number;
  framerate: number;
}

export class Project {
  id = v4();
  layers: TLayer[] = [];
  selectedLayer: string | undefined = undefined;
  width = 0;
  height = 0;
  animated = false;
  time = 0;
  playing = false;
  clips: Record<string, AutomationClip[]> = {};
  points: Record<string, Record<string, AutomationPoint[]>> = {};
  loading = false;
  error: string | undefined = undefined;
  onRender = () => {};
  lastFrameTime: number = new Date().getTime();
  recordingSettings: RecordingSettings = {
    start: 0,
    duration: 10,
    framerate: 60,
    videoBitrate: 6000000,
  };

  constructor(public filename: string) {
    makeAutoObservable(this);
  }

  get maxClipEnd() {
    let max = 0;
    for (const clips of Object.values(this.clips)) {
      for (const clip of clips) {
        max = Math.max(clip.end, max);
      }
    }

    return max;
  }

  removeCurrentLayer() {
    this.layers = this.layers.filter(layer => layer.id !== this.selectedLayer);
    this.selectedLayer = this.layers[this.layers.length - 1]?.id;
    this.onRender();
  }

  addGroup() {
    const layer = createGroupLayer();
    this.addLayer(layer);
  }

  addFilter(filter: Filter) {
    const layer = createFilterLayer(filter);
    this.addLayer(layer);
    this.onRender();
  }

  addSourceLayer(
    url: string,
    type: 'image' | 'video',
    name?: string
  ): Promise<void> {
    const source = createSource(url, type);

    const sourceLayer = createSourceLayer(source);
    sourceLayer.name = name;

    this.loading = true;

    return new Promise(resolve => {
      const onload = () => {
        if (source instanceof HTMLVideoElement) {
          if (!source.duration) {
            this.error = 'Corrupted video file.';
            this.loading = false;
            return;
          }

          this.clips[sourceLayer.id] = [
            {
              id: uuid(),
              start: 0,
              absoluteStart: 0,
              end: source.duration,
              duration: source.duration,
            },
          ];
        }

        this.loading = false;
        if (this.height === 0 || this.width === 0) {
          const [width, height] = glueGetSourceDimensions(source);
          this.width = width;
          this.height = height;
        }
        this.addLayer(sourceLayer);
        resolve();
      };

      if (glueIsSourceLoaded(source)) {
        onload();
      } else {
        if (source instanceof HTMLImageElement) {
          source.onload = onload;
        } else {
          source.addEventListener('loadedmetadata', onload);
          source.load();
        }
      }
    });
  }

  addLayer(layer: TLayer) {
    this.layers = [layer, ...this.layers];
    this.selectedLayer = layer.id;
    this.clips[layer.id] = [
      {
        id: uuid(),
        start: 0,
        end: this.maxClipEnd,
      },
    ];
    this.onRender();
  }

  getLayerSetting(layer: TLayer, setting: FilterSetting) {
    let value = layer.settings[setting.key] ?? setting.defaultValue;

    if (this.animated) {
      const points = this.points[layer.id]?.[setting.key];

      if (setting.type === FilterSettingType.OFFSET) {
        value = [...value];
        const pointsX = this.points[layer.id]?.[setting.key + '_x'];
        const pointsY = this.points[layer.id]?.[setting.key + '_y'];

        if (pointsX?.length > 0) {
          value[0] = getY(this.time, pointsX);
        }
        if (pointsY?.length > 0) {
          value[1] = getY(this.time, pointsY);
        }
      } else if (points?.length > 0) {
        value = getY(this.time, points);
      }
    }

    return value;
  }

  isLayerVisible(layer: TLayer) {
    if (
      layer.type === LayerType.GROUP &&
      !this.layers.filter(item => item.parentId === layer.id).length
    ) {
      return false;
    }

    if (
      typeof layer.settings['opacity'] === 'number' &&
      layer.settings['opacity'] <= 0.01
    ) {
      return false;
    }

    const clips = this.clips[layer.id];
    if (!this.animated || !clips) {
      return layer.visible;
    }

    if (!layer.visible) {
      return false;
    }

    for (const clip of clips) {
      if (this.time >= clip.start && this.time <= clip.end) {
        return true;
      }
    }

    return false;
  }

  getVideoTime(layer: SourceLayer) {
    if (!(layer.source instanceof HTMLVideoElement)) {
      return 0;
    }

    const clips = this.clips[layer.id];
    if (!this.animated || !clips) {
      return 0;
    }

    if (!layer.visible) {
      return 0;
    }

    for (const clip of clips) {
      if (
        this.time >= clip.start &&
        this.time <= clip.end &&
        typeof clip.absoluteStart === 'number'
      ) {
        return this.time - clip.absoluteStart;
      }
    }

    return this.time;
  }

  togglePlayback() {
    if (!this.playing) {
      this.startPlayback();
    } else {
      this.stopPlayback();
    }
  }

  startPlayback() {
    this.playing = true;
    this.lastFrameTime = new Date().getTime();
    this.onRender();

    for (const layer of this.layers) {
      if (layer.type !== LayerType.SOURCE) {
        continue;
      }

      if (layer.source instanceof HTMLVideoElement) {
        layer.source.play();
      }
    }
  }

  stopPlayback() {
    this.playing = false;

    for (const layer of this.layers) {
      if (layer.type !== LayerType.SOURCE) {
        continue;
      }

      if (layer.source instanceof HTMLVideoElement) {
        layer.source.pause();
      }
    }
  }

  setTime(time: number) {
    this.time = time;
    for (const layer of this.layers) {
      if (layer.type !== LayerType.SOURCE) {
        continue;
      }

      if (layer.source instanceof HTMLVideoElement) {
        layer.source.currentTime = this.getVideoTime(layer);
      }
    }

    this.onRender();
    setTimeout(() => this.onRender(), 200);
  }
}
