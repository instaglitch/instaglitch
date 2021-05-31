import { FilterSettingType } from '../../types';
import { buildShaderFilter } from '../buildShaderFilter';

const fragmentShader = `void main()
{
  vec2 p = gl_FragCoord.xy / iResolution.xy;
  gl_FragColor = texture2D(iTexture, p);
  gl_FragColor.rgb += sin((p.y / (iScale * 0.01) - (6.28))) * iIntensity;
}`;

export const Scanlines = buildShaderFilter({
  id: 'scanlines',
  name: 'Scanlines',
  fragmentShader,
  settings: [
    {
      key: 'iIntensity',
      defaultValue: 0.02,
      name: 'Intensity',
      type: FilterSettingType.FLOAT,
      minValue: 0,
      maxValue: 1,
    },
    {
      key: 'iScale',
      defaultValue: 0.25,
      name: 'Scale',
      type: FilterSettingType.FLOAT,
      minValue: 0,
      maxValue: 1,
    },
  ],
});
