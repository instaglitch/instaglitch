import {
  WebGLRenderer,
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
uniform float iIntensity;
uniform float iScale;

vec4 scanline(vec2 coord, vec4 screen)
{
    const float spd = 1.0;
    screen.rgb += sin((coord.y / iScale - (6.28))) * iIntensity;
    return screen;
}

void main()
{
    vec2 p = gl_FragCoord.xy / iResolution.xy;
    gl_FragColor = texture2D(iTexture, p);
    
    gl_FragColor = scanline(p, gl_FragColor);
}`;

let uniforms = {
  iResolution: new Uniform(new Vector3()),
  iTexture: new Uniform(null),
  iIntensity: new Uniform(0.5),
  iScale: new Uniform(0.25),
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
  uniforms.iIntensity.value = settings!.intensity;
  uniforms.iScale.value = settings!.scale * 0.01;
  uniforms.iTexture.value = texture;

  return renderShaderFilter(renderer, shaderMaterial, final);
}

export const Scanlines: Filter = {
  id: 'scanlines',
  name: 'Scanlines',
  pass,
  settings: [
    {
      key: 'intensity',
      defaultValue: 0.02,
      name: 'Intensity',
      type: FilterSettingType.FLOAT,
      minValue: 0,
      maxValue: 1,
    },
    {
      key: 'scale',
      defaultValue: 0.25,
      name: 'Scale',
      type: FilterSettingType.FLOAT,
      minValue: 0,
      maxValue: 1,
    },
  ],
};
