import React, { useContext } from 'react';
import { makeAutoObservable } from 'mobx';
import { v4 as uuid } from 'uuid';
import {
  GlueCanvas,
  glueIsSourceLoaded,
  glueGetSourceDimensions,
  GlueSourceType,
} from 'fxglue';

import {
  Filter,
  FilterSettingType,
  SourceLayer,
  LayerType,
  Project,
  TLayer,
  FilterSetting,
} from './types';
import { createFilterLayer } from './filters/functions';
import { getY } from './components/timeline/Utils';
import { getMediaRecorder } from './Utils';
import { sourceSettings } from './sourceSettings';

declare class ClipboardItem {
  constructor(data: any);
}

function createSourceLayer(source: GlueSourceType): SourceLayer {
  const settings: Record<string, any> = {};

  for (const setting of sourceSettings) {
    settings[setting.key] = setting.defaultValue;
  }

  return {
    id: uuid(),
    type: LayerType.SOURCE,
    source,
    visible: true,
    settings,
  };
}

function calculateScale(width: number, height: number, maxSize: number) {
  if (maxSize) {
    return Math.min(Math.min(maxSize / width, maxSize / height), 1);
  }

  return 1;
}

export enum FileInputMode {
  NEW,
  ADD,
}

class ProjectStore {
  currentProjectId?: string = undefined;
  projects: Project[] = [];
  loading = false;
  showFilterGallery = false;
  showAbout = false;
  showExport = false;
  showWebcam = false;
  showProperties = false;
  glueCanvas = new GlueCanvas();
  canvas = this.glueCanvas.canvas;
  glue = this.glueCanvas.glue;
  gl = this.glueCanvas.gl;
  exportQuality = 0.7;
  exportScale = 1.0;
  fileInput = document.createElement('input');
  fileInputMode: FileInputMode = FileInputMode.NEW;
  lastFrameTime: number = new Date().getTime();
  mediaRecorder: any = undefined;

  constructor() {
    makeAutoObservable(this);

    this.fileInput.type = 'file';
    this.fileInput.accept = 'image/*;video/*';
    this.fileInput.addEventListener('change', () => {
      if (this.fileInput.files?.length) {
        this.handleFile(this.fileInput.files[0], this.fileInputMode);
        this.fileInput.value = '';
      }
    });
    this.fileInput.style.position = 'absolute';
    this.fileInput.style.opacity = '0.001';
    this.fileInput.style.pointerEvents = 'none';
    this.fileInput.style.zIndex = '-1';
    document.body.appendChild(this.fileInput);
  }

  openFilePicker(mode: FileInputMode = FileInputMode.NEW) {
    this.fileInputMode = mode;
    this.fileInput.click();
  }

  handleFile(file: File, mode: FileInputMode = FileInputMode.NEW) {
    this.loading = true;
    const reader = new FileReader();

    reader.addEventListener('load', () => {
      this.loading = false;

      const dataUrl = reader.result as string;
      const type = file.type.startsWith('video') ? 'video' : 'image';

      if (mode === FileInputMode.NEW) {
        this.addProjectFromURL(dataUrl, type, file.name);
      } else {
        this.addSourceLayer(dataUrl, type, file.name);
      }
    });

    reader.addEventListener('error', () => {
      this.loading = false;
    });

    reader.readAsDataURL(file);
  }

  addProjectFromURL(
    url: string,
    type: 'image' | 'video',
    filename = 'untitled.jpg'
  ) {
    const source =
      type === 'image' ? new Image() : document.createElement('video');
    source.src = url;
    this.addProjectFromSource(source, filename);
  }

  addProjectFromSource(source: GlueSourceType, filename = 'untitled.jpg') {
    const sourceLayer = createSourceLayer(source);
    sourceLayer.name = filename;

    const project: Project = {
      id: uuid(),
      filename,
      layers: [sourceLayer],
      selectedLayer: sourceLayer.id,
      width: 0,
      height: 0,
      animated: false,
      time: 0,
      playing: false,
      clips: {},
      points: {},
    };

    this.loading = true;

    const onload = () => {
      const [width, height] = glueGetSourceDimensions(source);
      project.width = width;
      project.height = height;

      this.currentProjectId = project.id;
      this.projects.push(project);

      this.loading = false;

      this.requestPreviewRender();
    };

    if (glueIsSourceLoaded(source)) {
      onload();
    } else {
      if (source instanceof HTMLImageElement) {
        source.onload = onload;
      } else {
        source.addEventListener('loadeddata', onload);
        source.load();
      }
    }
  }

  addSourceLayer(url: string, type: 'image' | 'video', name?: string) {
    const source =
      type === 'image' ? new Image() : document.createElement('video');
    source.src = url;

    const sourceLayer = createSourceLayer(source);
    sourceLayer.name = name;

    this.loading = true;

    const onload = () => {
      if (!this.currentProject) {
        this.loading = false;
        return;
      }

      this.currentProject.layers = [sourceLayer, ...this.currentProject.layers];
      this.currentProject.selectedLayer = sourceLayer.id;
      this.loading = false;
      this.requestPreviewRender();
    };

    if (glueIsSourceLoaded(source)) {
      onload();
    } else {
      source.onload = onload;
    }
  }

  get currentProject() {
    return this.projects.find(project => project.id === this.currentProjectId);
  }

  addFilter(filter: Filter) {
    if (!this.currentProject) {
      return;
    }

    const layer = createFilterLayer(filter);
    this.currentProject.layers = [layer, ...this.currentProject.layers];
    this.currentProject.selectedLayer = layer.id;
    this.requestPreviewRender();
    this.showFilterGallery = false;
  }

  removeCurrentLayer() {
    if (!this.currentProject) {
      return;
    }

    this.currentProject.layers = this.currentProject.layers.filter(
      layer => layer.id !== this.currentProject?.selectedLayer
    );
    this.currentProject.selectedLayer =
      this.currentProject.layers[this.currentProject.layers.length - 1]?.id;
    this.requestPreviewRender();
  }

  closeProject(id: string) {
    const project = this.projects.find(project => project.id === id);
    if (project) {
      for (const layer of project.layers.filter(
        layer => layer.type === LayerType.SOURCE
      )) {
        this.glue.deregisterTexture(layer.id);
      }
    }

    this.projects = this.projects.filter(project => project.id !== id);
    if (this.currentProjectId === id) {
      this.currentProjectId = this.projects[0]?.id;
    }
  }

  renderAndSave(maxSize = 0, format = 'image/png', quality = 1.0) {
    this.loading = true;
    this.renderCurrentProject(maxSize);
    this.gl.flush();

    const dataUrl = this.canvas.toDataURL(format, quality)!;
    const suffix = '_instaglitch.' + (format === 'image/png' ? 'png' : 'jpg');
    const currentFilename = this.currentProject?.filename || 'untitled';
    const currentName = currentFilename.split('.')[0];

    const element = document.createElement('a');
    element.setAttribute('href', dataUrl);
    element.setAttribute('download', currentName + suffix);

    element.style.display = 'none';
    element.click();

    this.requestPreviewRender();
    this.loading = false;
  }

  requestPreviewRender() {
    requestAnimationFrame(() => this.renderCurrentProject());
  }

  getLayerSetting(layer: TLayer, setting: FilterSetting) {
    if (!this.currentProject) {
      return setting.defaultValue;
    }

    let value = layer.settings[setting.key] ?? setting.defaultValue;

    if (this.currentProject.animated) {
      const points = this.currentProject.points[layer.id]?.[setting.key];

      if (setting.type === FilterSettingType.OFFSET) {
        value = [...value];
        const pointsX =
          this.currentProject.points[layer.id]?.[setting.key + '_x'];
        const pointsY =
          this.currentProject.points[layer.id]?.[setting.key + '_y'];

        if (pointsX?.length > 0) {
          value[0] = getY(this.currentProject.time, pointsX);
        }
        if (pointsY?.length > 0) {
          value[1] = getY(this.currentProject.time, pointsY);
        }
      } else if (points?.length > 0) {
        value = getY(this.currentProject.time, points);
      }
    }

    return value;
  }

  renderCurrentProject(maxSize = 800) {
    if (!this.currentProject) {
      return;
    }

    const { width, height } = this.currentProject;
    const scale = calculateScale(width, height, maxSize);
    this.glueCanvas.setSize(width * scale, height * scale);

    const layers = this.currentProject.layers
      .filter(layer => layer.visible)
      .reverse();

    const glue = this.glue;

    for (const layer of layers) {
      if (layer.type === LayerType.FILTER) {
        if (!glue.hasProgram(layer.filter.id)) {
          glue.registerProgram(
            layer.filter.id,
            layer.filter.fragmentShader,
            layer.filter.vertexShader
          );
        }

        if (layer.filter.settings) {
          for (const setting of layer.filter.settings) {
            glue
              .program(layer.filter.id)
              ?.uniforms.set(setting.key, this.getLayerSetting(layer, setting));
          }
        }

        glue.program(layer.filter.id)?.apply();
      } else {
        if (!glue.hasTexture(layer.id)) {
          if (!glueIsSourceLoaded(layer.source)) {
            continue;
          }

          glue.registerTexture(layer.id, layer.source);
        }

        if (layer.source instanceof HTMLVideoElement) {
          try {
            glue.texture(layer.id)?.update(layer.source);
          } catch {}
        }

        const [width, height] = glueGetSourceDimensions(layer.source);

        const settings: Record<string, any> = {};
        for (const setting of sourceSettings) {
          settings[setting.key] = this.getLayerSetting(layer, setting);
        }

        glue.texture(layer.id)?.draw({
          x: width * settings.offset[0] * scale,
          y: height * settings.offset[1] * scale,
          width: width * scale * settings.scale,
          height: height * scale * settings.scale,
          opacity: settings.opacity,
          mode: settings.mode,
        });
      }
    }

    glue.render();

    const time = new Date().getTime();
    if (this.currentProject.playing && this.currentProject.animated) {
      this.currentProject.time += (time - this.lastFrameTime) / 1000;

      if (this.mediaRecorder && this.currentProject.time > 10) {
        this.currentProject.playing = false;
        this.mediaRecorder.stop();
        return;
      }

      this.requestPreviewRender();
    }
    this.lastFrameTime = time;
  }

  copyToClipboard() {
    this.renderCurrentProject(800);
    this.gl.flush();

    this.canvas.toBlob(async blob => {
      try {
        const clipboardItemInput = new ClipboardItem({ 'image/png': blob });
        await (navigator.clipboard as any).write([clipboardItemInput]);
      } catch {}
    }, 'image/png');
  }

  startPlayback() {
    if (!this.currentProject) {
      return;
    }

    this.currentProject.playing = true;
    this.lastFrameTime = new Date().getTime();
    this.requestPreviewRender();

    for (const layer of this.currentProject.layers) {
      if (layer.type !== LayerType.SOURCE) {
        continue;
      }

      if (layer.source instanceof HTMLVideoElement) {
        layer.source.play();
      }
    }
  }

  stopPlayback() {
    if (!this.currentProject) {
      return;
    }

    this.currentProject.playing = false;

    for (const layer of this.currentProject.layers) {
      if (layer.type !== LayerType.SOURCE) {
        continue;
      }

      if (layer.source instanceof HTMLVideoElement) {
        layer.source.pause();
      }
    }
  }

  setTime(time: number) {
    if (!this.currentProject) {
      return;
    }

    this.currentProject.time = time;
    for (const layer of this.currentProject.layers) {
      if (layer.type !== LayerType.SOURCE) {
        continue;
      }

      if (layer.source instanceof HTMLVideoElement) {
        layer.source.currentTime = this.currentProject.time;
      }
    }

    this.requestPreviewRender();
    setTimeout(() => this.requestPreviewRender(), 100);
  }

  recordVideo() {
    if (!(this.canvas as any).captureStream) {
      return;
    }

    this.loading = true;

    const blobs: Blob[] = [];
    const stream: MediaStream = (this.canvas as any).captureStream(60);
    const mediaRecorder = getMediaRecorder(stream);

    this.lastFrameTime = new Date().getTime();
    this.setTime(0);
    this.startPlayback();

    mediaRecorder.start(100);
    this.mediaRecorder = mediaRecorder;

    mediaRecorder.ondataavailable = (e: any) => {
      if (e.data && e.data.size > 0) {
        blobs.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const buffer = new Blob(blobs, { type: mediaRecorder.mimeType });
      const url = window.URL.createObjectURL(buffer);

      const suffix =
        '_instaglitch.' +
        (mediaRecorder.mimeType.includes('webm') ? 'webm' : 'mp4');
      const currentFilename = this.currentProject?.filename || 'untitled';
      const currentName = currentFilename.split('.')[0];

      const element = document.createElement('a');
      element.setAttribute('href', url);
      element.setAttribute('download', currentName + suffix);

      element.style.display = 'none';
      element.click();
      this.mediaRecorder = undefined;
      this.loading = false;
    };
  }
}

const projectStore = new ProjectStore();

const ProjectStoreContext = React.createContext(projectStore);

export const useProjectStore = () => useContext(ProjectStoreContext);
