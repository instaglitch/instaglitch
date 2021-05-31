import { FilterSettingType } from '../../types';
import { buildShaderFilter } from '../buildShaderFilter';

const fragmentShader = `void main()
{
  vec2 p = gl_FragCoord.xy / iResolution.xy;
  gl_FragColor = texture2D(iTexture, p);
  float dx = iIntensity * abs(p.x - .5);
  float dy = iIntensity * abs(p.y - .5);
  gl_FragColor *= (1.0 - dx * dx - dy * dy);
}`;

export const Vignette = buildShaderFilter({
  id: 'vignette',
  name: 'Vignette',
  fragmentShader,
  settings: [
    {
      key: 'iIntensity',
      defaultValue: 1.3,
      name: 'Intensity',
      type: FilterSettingType.FLOAT,
      minValue: 1,
      maxValue: 3,
    },
  ],
});
