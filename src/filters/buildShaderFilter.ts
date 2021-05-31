import {
  Uniform,
  Vector3,
  Vector2,
  ShaderMaterial,
  WebGLRenderer,
  Texture,
} from 'three';

import { Filter, FilterSetting, FilterSettingType } from '../types';
import { renderShaderFilter } from './functions';

export interface ShaderFilterBuildProps {
  id: string;
  name: string;
  description?: string;
  settings?: FilterSetting[];
  fragmentShader?: string;
  vertexShader?: string;
}

export function buildShaderFilter(props: ShaderFilterBuildProps): Filter {
  let uniforms: any = {
    iResolution: new Uniform(new Vector3()),
    iTexture: new Uniform(null),
  };

  let shaderPrefix = `#include <common>

  uniform sampler2D iTexture;
  uniform vec3 iResolution;
`;

  if (props.settings) {
    for (const setting of props.settings) {
      switch (setting.type) {
        case FilterSettingType.BOOLEAN:
          shaderPrefix += `uniform bool ${setting.key};\n`;
          uniforms[setting.key] = new Uniform(false);
          break;
        case FilterSettingType.OFFSET:
          shaderPrefix += `uniform vec2 ${setting.key};\n`;
          uniforms[setting.key] = new Uniform(new Vector2());
          break;
        case FilterSettingType.FLOAT:
        case FilterSettingType.INTEGER:
          shaderPrefix += `uniform float ${setting.key};\n`;
          uniforms[setting.key] = new Uniform(setting.defaultValue);
          break;
        case FilterSettingType.COLOR:
          throw new Error('Color setting is not supported yet.');
      }
    }
  }

  const shaderMaterial: ShaderMaterial = new ShaderMaterial({
    uniforms,
    fragmentShader: props.fragmentShader
      ? shaderPrefix + props.fragmentShader
      : undefined,
    vertexShader: props.vertexShader
      ? shaderPrefix + props.vertexShader
      : undefined,
  });

  return {
    id: props.id,
    name: props.name,
    description: props.description,
    pass: (
      renderer: WebGLRenderer,
      texture: Texture,
      width: number,
      height: number,
      final: boolean,
      settings?: Record<string, any>
    ) => {
      uniforms.iResolution.value.set(width, height, 1);
      uniforms.iTexture.value = texture;

      if (settings) {
        for (const key of Object.keys(settings)) {
          if (uniforms[key]) {
            if (Array.isArray(uniforms[key])) {
              uniforms[key].value.set(...settings[key]);
            } else {
              uniforms[key].value = settings[key];
            }
          }
        }
      }

      return renderShaderFilter(renderer, shaderMaterial, final);
    },
    settings: props.settings,
  };
}
