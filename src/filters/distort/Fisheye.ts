import { FilterSettingType } from '../../types';
import { buildShaderFilter } from '../buildShaderFilter';

const fragmentShader = `void main()
{
  vec2 p = gl_FragCoord.xy / iResolution.xy;

  vec2 neg1to1 = p;
  neg1to1 = (neg1to1 - 0.5) * 2.0;
  
  vec2 offset;
  offset.x = ( pow(neg1to1.y,2.0)) * iIntensity * (neg1to1.x);
  offset.y = ( pow(neg1to1.x,2.0)) * iIntensity * (neg1to1.y);
  p += offset;
  
  gl_FragColor = texture2D(iTexture, p);
}`;

export const Fisheye = buildShaderFilter({
  id: 'fisheye',
  name: 'Fisheye',
  fragmentShader,
  settings: [
    {
      key: 'iIntensity',
      defaultValue: 0.1,
      name: 'Intensity',
      type: FilterSettingType.FLOAT,
      minValue: -2.0,
      maxValue: 2.0,
    },
  ],
});
