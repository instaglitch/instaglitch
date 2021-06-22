import { LayerType, TLayer } from './types';

export const truncate = (str: string, maxLength = 25) => {
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

interface MediaRecorderOptions {
  mimeType?: string;
  audioBitsPerSecond?: number;
  videoBitsPerSecond?: number;
  bitsPerSecond?: number;
}

interface MediaRecorderDataAvailableEvent extends Event {
  data: Blob;
}

declare class MediaRecorder {
  constructor(stream: MediaStream, options?: MediaRecorderOptions);

  static isTypeSupported(type: string): boolean;
  pause(): void;
  requestData(): void;
  resume(): void;
  start(timeslice?: number): void;
  stop(): void;

  readonly stream: MediaStream;
  readonly state: 'recording' | 'inactive' | 'paused';
  readonly mimeType: string;

  onstop: (e: Event) => void;
  onstart: (e: Event) => void;
  onresume: (e: Event) => void;
  onpause: (e: Event) => void;
  onerror: (e: Event) => void;
  ondataavailable: (e: MediaRecorderDataAvailableEvent) => void;
}

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

export function getMediaRecorder(stream: MediaStream) {
  if (!supportsMediaRecorder()) {
    return undefined;
  }

  try {
    const suppportedTypes = getSupportedMimeTypes();
    return new MediaRecorder(stream, {
      mimeType: suppportedTypes[0],
      videoBitsPerSecond: 25000000,
    });
  } catch {
    return undefined;
  }
}
