import { LayerType, TLayer } from './types';

export const truncate = (str: string) => {
  const maxLength = 25;

  if (str.length < maxLength) {
    return str;
  }

  const split = str.split('.');
  if (split.length < 0) {
    return '';
  }

  let extension = split.pop() as string;
  const name = split.join('.');
  if (extension.length > 4) {
    extension = 'jpg';
  }

  if (name.length > maxLength - 5) {
    const maxPartLength = Math.floor((maxLength - 5) / 2);

    return (
      name.substr(0, maxPartLength) +
      '...' +
      name.substr(name.length - maxPartLength) +
      '.' +
      extension
    );
  }
};

export const layerName = (layer: TLayer) => {
  return layer.type === LayerType.IMAGE
    ? layer.name || 'Image'
    : layer.filter.name;
};
