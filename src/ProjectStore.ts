import React, { useContext } from 'react';
import { makeAutoObservable } from 'mobx';
import { v4 as uuid } from 'uuid';
import { GlueCanvas } from 'fxglue';

import { Filter, ImageLayer, LayerType, Project } from './types';
import { createFilterLayer } from './filters/functions';

function createImageLayer(image: HTMLImageElement): ImageLayer {
  return {
    id: uuid(),
    type: LayerType.IMAGE,
    image,
    visible: true,
  };
}

function calculatePreviewSize(width: number, height: number, maxSize: number) {
  if (maxSize) {
    let scale = 1;

    scale = Math.min(Math.min(maxSize / width, maxSize / height), 1);

    width *= scale;
    height *= scale;
  }

  return [width, height] as const;
}

class ProjectStore {
  currentProjectId?: string = undefined;
  projects: Project[] = [];
  loading = false;
  showFilterGallery = false;
  showAbout = false;
  showExport = false;
  glueCanvas = new GlueCanvas();
  canvas = this.glueCanvas.canvas;
  glue = this.glueCanvas.glue;
  exportQuality = 0.7;
  exportScale = 1.0;
  fileInput = document.createElement('input');

  constructor() {
    makeAutoObservable(this);

    this.fileInput.type = 'file';
    this.fileInput.accept = 'image/*';
    this.fileInput.addEventListener('change', () => {
      if (this.fileInput.files?.length) {
        this.addProjectFromFile(this.fileInput.files[0]);
        this.fileInput.value = '';
      }
    });
    this.fileInput.style.position = 'absolute';
    this.fileInput.style.opacity = '0.001';
    this.fileInput.style.pointerEvents = 'none';
    this.fileInput.style.zIndex = '-1';
    document.body.appendChild(this.fileInput);
  }

  openFilePicker() {
    this.fileInput.click();
  }

  addProjectFromFile(file: File) {
    this.loading = true;
    const reader = new FileReader();

    reader.addEventListener('load', () => {
      this.loading = false;
      this.addProjectFromURL(reader.result as string, file.name);
    });

    reader.addEventListener('error', () => {
      this.loading = false;
    });

    reader.readAsDataURL(file);
  }

  addProjectFromURL(url: string, filename = 'untitled.jpg') {
    const image = new Image();
    image.src = url;
    this.addProjectFromImage(image, filename);
  }

  addProjectFromImage(image: HTMLImageElement, filename = 'untitled.jpg') {
    const imageLayer = createImageLayer(image);

    const project: Project = {
      id: uuid(),
      filename,
      layers: [imageLayer],
      selectedLayer: imageLayer.id,
      width: 0,
      height: 0,
    };

    this.loading = true;

    const onload = () => {
      project.width = image.naturalWidth;
      project.height = image.naturalHeight;

      this.currentProjectId = project.id;
      this.projects.push(project);

      this.loading = false;

      this.requestPreviewRender();
    };

    if (image.complete && image.naturalHeight !== 0) {
      onload();
    } else {
      image.onload = onload;
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
      this.currentProject.layers[this.currentProject.layers.length - 1].id;
    this.requestPreviewRender();
  }

  closeProject(id: string) {
    const project = this.projects.find(project => project.id === id);
    if (project) {
      for (const layer of project.layers.filter(
        layer => layer.type === LayerType.IMAGE
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

  renderCurrentProject(maxSize = 800) {
    if (!this.currentProject) {
      return;
    }

    let { width, height } = this.currentProject;
    [width, height] = calculatePreviewSize(width, height, maxSize);
    this.glueCanvas.setSize(width, height);

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
            const value = layer.settings[setting.key] ?? setting.defaultValue;
            glue.program(layer.filter.id)?.uniforms.set(setting.key, value);
          }
        }

        glue.program(layer.filter.id)?.apply();
      } else {
        if (!glue.hasTexture(layer.id)) {
          if (!layer.image.complete || layer.image.naturalHeight === 0) {
            continue;
          }

          glue.registerTexture(layer.id, layer.image);
        }

        glue.texture(layer.id)?.draw({
          width,
          height,
        });
      }
    }

    glue.render();
  }
}

const projectStore = new ProjectStore();

const ProjectStoreContext = React.createContext(projectStore);

export const useProjectStore = () => useContext(ProjectStoreContext);
