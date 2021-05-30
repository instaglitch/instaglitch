import {
  WebGLRenderer,
  Vector3,
  ShaderMaterial,
  Uniform,
  Texture,
} from 'three';
import { Filter } from '../../types';
import { renderShaderFilter } from '../functions';

const fragmentShader = `#include <common>

uniform sampler2D iTexture;
uniform vec3 iResolution;

vec2 fisheye(vec2 coord, float str)
{
    vec2 neg1to1 = coord;
    neg1to1 = (neg1to1 - 0.5) * 2.0;
    
    vec2 offset;
    offset.x = ( pow(neg1to1.y,2.0)) * str * (neg1to1.x);
    offset.y = ( pow(neg1to1.x,2.0)) * str * (neg1to1.y);
    
    return coord + offset;
}

void main()
{
    vec2 p = gl_FragCoord.xy / iResolution.xy;
    p = fisheye(p, 0.1);
    gl_FragColor = texture2D(iTexture, p);
}`;

let uniforms = {
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
  final: boolean
) {
  uniforms.iResolution.value.set(width, height, 1);
  uniforms.iTexture.value = texture;

  return renderShaderFilter(renderer, shaderMaterial, final);
}

export const Fisheye: Filter = {
  id: 'fisheye',
  name: 'Fisheye',
  pass,
};
