import {
  WebGLRenderer,
  Vector2,
  Vector3,
  ShaderMaterial,
  Uniform,
  Texture,
} from 'three';
import { Filter, FilterSettingType } from '../../types';
import { renderShaderFilter } from '../functions';

const fragmentShader = `#include <common>

uniform sampler2D iTexture;
uniform vec3 iResolution;
uniform vec2 iROffset;
uniform vec2 iGOffset;
uniform vec2 iBOffset;

void main()
{
	vec2 uv = gl_FragCoord.xy / iResolution.xy;

  vec3 col;
  col.r = texture(iTexture, vec2(uv.x - iROffset.x, uv.y + iROffset.y)).r;
  col.g = texture(iTexture, vec2(uv.x - iGOffset.x, uv.y + iGOffset.y)).g;
  col.b = texture(iTexture, vec2(uv.x - iBOffset.x, uv.y + iBOffset.y)).b;
  
  gl_FragColor = vec4(col,1.0);
}`;

let uniforms = {
  iROffset: new Uniform(new Vector2()),
  iGOffset: new Uniform(new Vector2()),
  iBOffset: new Uniform(new Vector2()),
  iResolution: new Uniform(new Vector3()),
  iTexture: new Uniform(null),
};

const shaderMaterial: ShaderMaterial = new ShaderMaterial({
  uniforms,
  fragmentShader,
});

function pass(
  renderer: WebGLRenderer,
  texture: Texture,
  width: number,
  height: number,
  final: boolean,
  settings?: Record<string, any>
) {
  uniforms.iResolution.value.set(width, height, 1);
  uniforms.iTexture.value = texture;
  uniforms.iROffset.value.set(...settings!.r_offset);
  uniforms.iGOffset.value.set(...settings!.g_offset);
  uniforms.iBOffset.value.set(...settings!.b_offset);

  return renderShaderFilter(renderer, shaderMaterial, final);
}

export const RGBOffset: Filter = {
  id: 'rgb_offset',
  name: 'RGB offset',
  pass,
  settings: [
    {
      key: 'r_offset',
      type: FilterSettingType.OFFSET,
      name: 'Red offset',
      defaultValue: [0, 0],
      color: '#ff0000',
    },
    {
      key: 'g_offset',
      type: FilterSettingType.OFFSET,
      name: 'Green offset',
      defaultValue: [-0.1, 0],
      color: '#00ff00',
    },
    {
      key: 'b_offset',
      type: FilterSettingType.OFFSET,
      name: 'Blue offset',
      defaultValue: [0, 0],
      color: '#0000ff',
    },
  ],
};
