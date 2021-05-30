import {
  Mesh,
  OrthographicCamera,
  PlaneBufferGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderTarget,
  WebGLRenderer,
} from 'three';
import { v4 as uuid } from 'uuid';

import { Filter, FilterLayer, LayerType } from '../types';

export function createFilterLayer(filter: Filter): FilterLayer {
  const settings: Record<string, any> = {};

  if (filter.settings) {
    for (const setting of filter.settings) {
      settings[setting.key] = setting.defaultValue;
    }
  }

  return {
    id: uuid(),
    type: LayerType.FILTER,
    filter: filter,
    settings,
    visible: true,
  };
}

const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
const scene = new Scene();

const shaderMesh = new Mesh(new PlaneBufferGeometry(2, 2));
shaderMesh.frustumCulled = false;

scene.add(shaderMesh);

const buffers: WebGLRenderTarget[] = [];

export function renderShaderFilter(
  renderer: WebGLRenderer,
  shaderMaterial: ShaderMaterial,
  final: boolean
) {
  if (!buffers[shaderMaterial.id]) {
    buffers[shaderMaterial.id] = new WebGLRenderTarget(1, 1);
  }
  const outputBuffer: WebGLRenderTarget = buffers[shaderMaterial.id];
  shaderMesh.material = shaderMaterial;

  const size = renderer.getDrawingBufferSize(new Vector2());
  outputBuffer.setSize(size.width, size.height);
  const output = final ? null : outputBuffer;

  renderer.setRenderTarget(output);
  renderer.render(scene, camera);

  return output?.texture;
}
