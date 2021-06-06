import { Filter, FilterSettingType } from '../types';

const defaultFragmentShader = `void main()
{
  vec2 p = gl_FragCoord.xy / iResolution.xy;
  gl_FragColor = texture2D(iTexture, p);
}`;

const defaultVertexShader = `void main() {
  gl_Position = vec4(position, 1.0);
}`;

export function buildShaderFilter(props: any): Filter {
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
          shaderPrefix += `uniform float ${setting.key};\n`;
          break;
        case FilterSettingType.INTEGER:
        case FilterSettingType.SELECT:
          shaderPrefix += `uniform int ${setting.key};\n`;
          break;
        case FilterSettingType.COLOR:
          shaderPrefix += `uniform vec4 ${setting.key};\n`;
          break;
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
