import { FilterSettingType } from '../../types';
import { buildShaderFilter } from '../buildShaderFilter';

const fragmentShader = `void main()
{
	vec2 uv = gl_FragCoord.xy / iResolution.xy;

  vec3 col;
  col.r = texture2D(iTexture, vec2(uv.x - iROffset.x, uv.y + iROffset.y)).r;
  col.g = texture2D(iTexture, vec2(uv.x - iGOffset.x, uv.y + iGOffset.y)).g;
  col.b = texture2D(iTexture, vec2(uv.x - iBOffset.x, uv.y + iBOffset.y)).b;
  
  gl_FragColor = vec4(col,1.0);
}`;

export const RGBOffset = buildShaderFilter({
  id: 'rgb_offset',
  name: 'RGB offset',
  fragmentShader,
  settings: [
    {
      key: 'iROffset',
      type: FilterSettingType.OFFSET,
      name: 'Red offset',
      defaultValue: [0, 0],
      color: '#ff0000',
    },
    {
      key: 'iGOffset',
      type: FilterSettingType.OFFSET,
      name: 'Green offset',
      defaultValue: [-0.1, 0],
      color: '#00ff00',
    },
    {
      key: 'iBOffset',
      type: FilterSettingType.OFFSET,
      name: 'Blue offset',
      defaultValue: [0, 0],
      color: '#0000ff',
    },
  ],
});
