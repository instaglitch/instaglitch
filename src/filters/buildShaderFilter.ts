import { Filter, FilterSetting, FilterSettingType } from '../types';

const defaultFragmentShader = `void main()
{
  vec2 p = gl_FragCoord.xy / iResolution.xy;
  gl_FragColor = texture2D(iTexture, p);
}`;

const defaultVertexShader = `void main() {
  gl_Position = vec4(position, 1.0);
}`;

export interface ShaderFilterBuildProps {
  id: string;
  name: string;
  description?: string;
  settings?: FilterSetting[];
  fragmentShader?: string;
  vertexShader?: string;
}

export function buildShaderFilter(props: ShaderFilterBuildProps): Filter {
  let shaderPrefix = '';

  if (props.settings) {
    for (const setting of props.settings) {
      switch (setting.type) {
        case FilterSettingType.BOOLEAN:
          shaderPrefix += `uniform bool ${setting.key};\n`;
          break;
        case FilterSettingType.OFFSET:
          shaderPrefix += `uniform vec2 ${setting.key};\n`;
          break;
        case FilterSettingType.FLOAT:
        case FilterSettingType.INTEGER:
          shaderPrefix += `uniform float ${setting.key};\n`;
          break;
        case FilterSettingType.COLOR:
          throw new Error('Color setting is not supported yet.');
      }
    }
  }

  return {
    id: props.id,
    name: props.name,
    description: props.description,
    settings: props.settings,
    fragmentShader: props.fragmentShader
      ? shaderPrefix + props.fragmentShader
      : defaultFragmentShader,
    vertexShader: props.vertexShader
      ? shaderPrefix + props.vertexShader
      : defaultVertexShader,
  };
}
