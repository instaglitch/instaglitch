import {
  WebGLRenderer,
  WebGLRenderTarget,
  Vector2,
  OrthographicCamera,
  MeshBasicMaterial,
  Mesh,
  PlaneBufferGeometry,
  Scene,
  Texture,
} from 'three';
const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
const scene = new Scene();

const shaderMaterial: MeshBasicMaterial = new MeshBasicMaterial();

const shaderMesh = new Mesh(new PlaneBufferGeometry(2, 2), shaderMaterial);
shaderMesh.frustumCulled = false;
const outputBuffer: WebGLRenderTarget = new WebGLRenderTarget(1, 1);

scene.add(shaderMesh);

export function renderTexture(
  renderer: WebGLRenderer,
  texture: Texture,
  width: number,
  height: number,
  final: boolean
) {
  shaderMaterial.map = texture;

  const size = renderer.getDrawingBufferSize(new Vector2());
  outputBuffer.setSize(size.width, size.height);
  const output = final ? null : outputBuffer;

  renderer.setRenderTarget(output);
  renderer.render(scene, camera);

  return output?.texture;
}
