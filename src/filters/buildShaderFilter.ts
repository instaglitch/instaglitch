import { Filter, FilterSettingType } from '../types';

const defaultFragmentShader = `void main()
{
  vec2 p = gl_FragCoord.xy / iResolution.xy;
  gl_FragColor = texture2D(iTexture, p);
}`;

const defaultVertexShader = `void main() {
  gl_Position = vec4(position, 1.0);
}`;

function uniformType(type: FilterSettingType) {
  switch (type) {
    case FilterSettingType.BOOLEAN:
      return 'bool';
    case FilterSettingType.OFFSET:
      return 'vec2';
    case FilterSettingType.FLOAT:
      return 'float';
    case FilterSettingType.INTEGER:
    case FilterSettingType.SELECT:
      return 'int';
    case FilterSettingType.COLOR:
      return 'vec4';
  }

  return 'unknown';
}

export function buildShaderFilter(props: any): Filter {
  let shaderPrefix = '';

  if (props.settings) {
    for (const setting of props.settings) {
      shaderPrefix += `uniform ${uniformType(setting.type)} ${setting.key};\n`;
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
