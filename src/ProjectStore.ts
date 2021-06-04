import React, { useContext } from 'react';
import { makeAutoObservable } from 'mobx';
import { v4 as uuid } from 'uuid';
import { Filter, ImageLayer, LayerType, Project } from './types';

import { createFilterLayer } from './filters/functions';
import { GlueCanvas } from 'fxglue';

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

  constructor() {
    makeAutoObservable(this);
  }

  openFilePicker() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.addEventListener('change', () => {
      if (fileInput.files?.length) {
        const file = fileInput.files[0];

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
    });
    fileInput.click();
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
        this.glue.deregisterImage(layer.id);
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

    const element = document.createElement('a');
    element.setAttribute('href', dataUrl);
    element.setAttribute(
      'download',
      format === 'image/png'
        ? 'instaglitch_export.png'
        : 'instaglitch_export.jpg'
    );

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
        if (!glue.hasImage(layer.id)) {
          if (!layer.image.complete || layer.image.naturalHeight === 0) {
            continue;
          }

          glue.registerImage(layer.id, layer.image);
        }

        glue.image(layer.id, 0, 0, width, height);
      }
    }

    glue.render();
  }
}

const projectStore = new ProjectStore();

const ProjectStoreContext = React.createContext(projectStore);

export const useProjectStore = () => useContext(ProjectStoreContext);
