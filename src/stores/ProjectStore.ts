import { makeAutoObservable } from 'mobx';
import { Muxer, ArrayBufferTarget } from 'mp4-muxer';
import {
  GlueCanvas,
  glueIsSourceLoaded,
  glueGetSourceDimensions,
} from 'fxglue';

import { LayerType, TLayer } from '../types';
import { getMediaRecorder } from '../Utils';
import { sourceSettings } from '../sourceSettings';
import { Project } from './Project';

function calculateScale(width: number, height: number, maxSize: number) {
  if (maxSize) {
    return Math.min(Math.min(maxSize / width, maxSize / height), 1);
  }

  return 1;
}

const USEC_PER_SEC = 1000 * 1000;

export enum FileInputMode {
  NEW,
  ADD,
}
class ProjectStore {
  currentProjectId?: string = undefined;
  projects: Project[] = [];
  modal: string | undefined = undefined;
  error: string | undefined = undefined;
  glueCanvas = new GlueCanvas();
  canvas = this.glueCanvas.canvas;
  glue = this.glueCanvas.glue;
  gl = this.glueCanvas.gl;
  exportQuality = 0.7;
  exportScale = 1.0;
  fileInput = document.createElement('input');
  fileInputMode: FileInputMode = FileInputMode.NEW;
  recordingCancel = false;
  recording = false;

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
    const url = URL.createObjectURL(file);
    const type = file.type.startsWith('video') ? 'video' : 'image';
    if (mode === FileInputMode.NEW) {
      this.addProjectFromURL(url, type, file.name);
    } else {
      this.currentProject?.addSourceLayer(url, type, file.name);
    }
  }

  async addProjectFromURL(
    url: string,
    type: 'image' | 'video',
    filename = 'untitled.jpg'
  ) {
    const project = new Project(filename);
    project.onRender = () => this.requestPreviewRender();
    await project.addSourceLayer(url, type, filename);
    this.currentProjectId = project.id;
    this.projects.push(project);
    this.requestPreviewRender();
  }

  get currentProject() {
    return this.projects.find(project => project.id === this.currentProjectId);
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
  }

  requestPreviewRender() {
    requestAnimationFrame(() => this.renderCurrentProject());
  }

  renderLayers(layers: TLayer[], scale = 1) {
    const project = this.currentProject;
    if (!project) {
      return;
    }

    const glue = this.glue;

    for (const layer of layers) {
      if (!project.isLayerVisible(layer)) {
        continue;
      }

      switch (layer.type) {
        case LayerType.FILTER: {
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
                ?.uniforms.set(
                  setting.key,
                  project.getLayerSetting(layer, setting)
                );
            }
          }

          glue.program(layer.filter.id)?.apply();
          break;
        }
        case LayerType.SOURCE: {
          if (!glue.hasTexture(layer.id)) {
            if (!glueIsSourceLoaded(layer.source)) {
              continue;
            }

            glue.registerTexture(layer.id, layer.source);
          }

          if (layer.source instanceof HTMLVideoElement) {
            try {
              const time = project.getVideoTime(layer);
              if (Math.abs(layer.source.currentTime - time) > 1) {
                layer.source.currentTime = time;
              }
              if (!glueIsSourceLoaded(layer.source)) {
                continue;
              }
              glue.texture(layer.id)?.update(layer.source);
            } catch {}
          }

          const [width, height] = glueGetSourceDimensions(layer.source);

          const settings: Record<string, any> = {};
          for (const setting of sourceSettings) {
            settings[setting.key] = project.getLayerSetting(layer, setting);
          }

          glue.texture(layer.id)?.draw({
            x: width * settings.offset[0] * scale,
            y: height * settings.offset[1] * scale,
            width: width * scale * settings.scale,
            height: height * scale * settings.scale,
            opacity: settings.opacity,
            mode: settings.mode,
            angle: settings.angle,
          });
          break;
        }
        case LayerType.GROUP: {
          const layers = project.layers
            .filter(item => item.parentId === layer.id)
            .reverse();
          glue.begin();
          this.renderLayers(layers, scale);
          const settings: Record<string, any> = {};
          for (const setting of sourceSettings) {
            settings[setting.key] = project.getLayerSetting(layer, setting);
          }

          const { width, height } = project;
          glue.end({
            x: width * settings.offset[0] * scale,
            y: height * settings.offset[1] * scale,
            width: width * scale * settings.scale,
            height: height * scale * settings.scale,
            opacity: settings.opacity,
            mode: settings.mode,
            angle: settings.angle,
          });
          break;
        }
      }
    }
  }

  renderCurrentProject(maxSize = 800) {
    const project = this.currentProject;
    if (!project) {
      return;
    }

    const { width, height } = project;
    const scale = calculateScale(width, height, maxSize);
    this.glueCanvas.setSize(width * scale, height * scale);

    const layers = project.layers.filter(item => !item.parentId).reverse();

    const glue = this.glue;
    this.renderLayers(layers, scale);
    glue.render();

    const time = new Date().getTime();
    if (project.playing && project.animated) {
      project.time += (time - project.lastFrameTime) / 1000;
      this.requestPreviewRender();
    }
    project.lastFrameTime = time;
  }

  copyToClipboard() {
    this.renderCurrentProject(800);
    this.gl.flush();

    this.canvas.toBlob(async blob => {
      try {
        const clipboardItemInput = new ClipboardItem({ 'image/png': blob! });
        await navigator.clipboard.write([clipboardItemInput]);
      } catch {}
    }, 'image/png');
  }

  async recordVideo() {
    const project = this.currentProject;
    if (!project) {
      return;
    }

    this.recording = true;
    this.recordingCancel = false;
    project.stopPlayback();

    const { width, height } = project;
    const { framerate, videoBitrate, start, duration } =
      project.recordingSettings;

    let muxer = new Muxer({
      target: new ArrayBufferTarget(),
      video: {
        codec: 'avc',
        width,
        height,
        frameRate: framerate,
      },
      fastStart: 'in-memory',
    });

    project.setTime(project.recordingSettings.start);
    const encoder = new VideoEncoder({
      output: (chunk, meta) => {
        muxer.addVideoChunk(chunk, meta);
      },
      error: error => {
        console.error(error);
      },
    });
    encoder.configure({
      codec: 'avc1.42001f',
      width,
      height,
      bitrate: videoBitrate,
      framerate,
    });

    let frameI = 0;
    const renderAndEncode = (keyFrame = frameI % 15 === 0) => {
      this.renderCurrentProject();
      const frame = new VideoFrame(this.canvas, {
        timestamp: (project.time - start) * USEC_PER_SEC,
      });
      encoder.encode(frame, { keyFrame });
      frame.close();
      frameI++;
    };

    const end = start + duration;
    const frameTime = 1 / framerate;
    while (project.time < end && !this.recordingCancel) {
      renderAndEncode();
      project.setTime(project.time + frameTime);
    }

    project.setTime(end);
    renderAndEncode();

    await encoder.flush();
    encoder.close();
    muxer.finalize();

    this.recording = false;
    this.modal = undefined;

    if (this.recordingCancel) {
      this.recordingCancel = false;
      return;
    }

    let buffer = new Blob([muxer.target.buffer], { type: 'video/mp4' });

    const url = URL.createObjectURL(buffer);

    const suffix = '_instaglitch.mp4';
    const currentFilename = this.currentProject?.filename || 'untitled';
    const currentName = currentFilename.split('.')[0];

    const element = document.createElement('a');
    element.setAttribute('href', url);
    element.setAttribute('download', currentName + suffix);

    element.style.display = 'none';
    element.click();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  }
}

export const projectStore = new ProjectStore();
