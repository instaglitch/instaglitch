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
  return layer.type === LayerType.SOURCE
    ? layer.name || 'Source'
    : layer.filter.name;
};

declare var MediaRecorder: any;

function getSupportedMimeTypes() {
  const VIDEO_TYPES = ['webm', 'ogg', 'mp4', 'x-matroska'];
  const VIDEO_CODECS = [
    'vp9',
    'vp9.0',
    'vp8',
    'vp8.0',
    'avc1',
    'av1',
    'h265',
    'h.265',
    'h264',
    'h.264',
    'opus',
  ];

  const supportedTypes: string[] = [];
  VIDEO_TYPES.forEach(videoType => {
    const type = `video/${videoType}`;
    VIDEO_CODECS.forEach(codec => {
      const variations = [
        `${type};codecs=${codec}`,
        `${type};codecs:${codec}`,
        `${type};codecs=${codec.toUpperCase()}`,
        `${type};codecs:${codec.toUpperCase()}`,
        `${type}`,
      ];
      variations.forEach(variation => {
        if (MediaRecorder.isTypeSupported(variation))
          supportedTypes.push(variation);
      });
    });
  });
  return supportedTypes;
}

export function getMediaRecorder(stream: MediaStream) {
  if (!(window as any)['MediaRecorder']) {
    return undefined;
  }

  try {
    const suppportedTypes = getSupportedMimeTypes();
    return new MediaRecorder(stream, { mimeType: suppportedTypes[0] });
  } catch {
    return undefined;
  }
}
