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

vec4 vignette(vec2 coord, vec4 screen)
{
    float dx = iIntensity * abs(coord.x - .5);
    float dy = iIntensity * abs(coord.y - .5);
    return screen * (1.0 - dx * dx - dy * dy);
}

void main()
{
    vec2 p = gl_FragCoord.xy / iResolution.xy;
    gl_FragColor = texture2D(iTexture, p);
    gl_FragColor = vignette(p, gl_FragColor);
}`;

let uniforms = {
  iResolution: new Uniform(new Vector3()),
  iTexture: new Uniform(null),
  iIntensity: new Uniform(0.3),
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
  uniforms.iIntensity.value = settings!.intensity + 1;
  uniforms.iTexture.value = texture;

  return renderShaderFilter(renderer, shaderMaterial, final);
}

export const Vignette: Filter = {
  id: 'vignette',
  name: 'Vignette',
  pass,
  settings: [
    {
      key: 'intensity',
      defaultValue: 0.3,
      name: 'Intensity',
      type: FilterSettingType.FLOAT,
      minValue: 0,
      maxValue: 1,
    },
  ],
};
