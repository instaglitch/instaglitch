import { LayerType, TLayer } from './types';

export const truncate = (str: string, maxLength = 32) => {
  if (str.length < maxLength) {
    return str;
  }

  const split = str.split('.');
  if (split.length === 0) {
    return '';
  }

  if (split.length > 1) {
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
  } else {
    const name = str;

    if (name.length > maxLength) {
      const maxPartLength = Math.floor(maxLength / 2);

      return (
        name.substr(0, maxPartLength) +
        '...' +
        name.substr(name.length - maxPartLength)
      );
    }
  }
};

export const layerName = (layer: TLayer) => {
  return layer.type === LayerType.SOURCE
    ? layer.name || 'Source'
    : layer.filter.name;
};

function getSupportedMimeTypes() {
  const VIDEO_TYPES = ['mp4', 'webm', 'ogg', 'x-matroska'];
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

export function supportsMediaRecorder() {
  return !!(window as any)['MediaRecorder'];
}

export function getMediaRecorder(
  stream: MediaStream,
  options: MediaRecorderOptions = {}
) {
  if (!supportsMediaRecorder()) {
    return undefined;
  }

  try {
    const suppportedTypes = getSupportedMimeTypes();
    return new MediaRecorder(stream, {
      mimeType: suppportedTypes[0],
      ...options,
    });
  } catch {
    return undefined;
  }
}
