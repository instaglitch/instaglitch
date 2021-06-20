import { AutomationPoint } from '../../types';

export function getExponentAfterDelta(
  exponent: number,
  delta: number,
  min = 0.1,
  max = 10
) {
  if (exponent < 1) {
    exponent = (-1 * 1) / exponent;
    exponent++;
  } else {
    exponent--;
  }

  exponent += delta;

  if (exponent < 0) {
    exponent--;
    exponent = (-1 * 1) / exponent;
  } else {
    exponent++;
  }

  exponent = Math.min(max, exponent);
  exponent = Math.max(min, exponent);

  return exponent;
}

export function getYBetweenTwoPoints(
  x: number,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  exponent: number
) {
  if (startX === x) {
    return startY;
  }

  if (endX === x) {
    return endY;
  }

  if (endY === startY) {
    return startY;
  }

  if (exponent < 1) {
    exponent = 1 / exponent;
    [endX, endY, startX, startY] = [startX, startY, endX, endY];
  }

  let fnX = Math.abs((x - startX) / (endX - startX));

  const fnY = Math.pow(fnX, exponent);

  return fnY * (endY - startY) + startY;
}

export function getY(x: number, points: AutomationPoint[]) {
  if (points.length === 0) {
    return 0;
  }

  if (x <= points[0].x) {
    return points[0].y;
  }

  let current = 0;
  while (points.length > current && x > points[current].x) {
    current++;
  }

  current--;

  const currentPoint = points[current];
  if (points.length <= current + 1) {
    return currentPoint.y;
  }

  const nextPoint = points[current + 1];

  return getYBetweenTwoPoints(
    x,
    currentPoint.x,
    currentPoint.y,
    nextPoint.x,
    nextPoint.y,
    currentPoint.exponent
  );
}

export function fnToChart(n: number, d: number, min: number, max: number) {
  const unit = d / (max - min);
  return (n - min) * unit;
}

export function chartToFn(n: number, d: number, min: number, max: number) {
  const unit = d / (max - min);
  return n / unit + min;
}

export function getResolution(pixelsPerSecond: number): {
  tickResolution: number;
  labelResolution: number;
} {
  let tickResolution = 1;
  let labelResolution = 5;

  if (pixelsPerSecond >= 10) {
    tickResolution = 1;
    labelResolution = 5;
  } else if (pixelsPerSecond >= 5) {
    tickResolution = 1;
    labelResolution = 10;
  } else if (pixelsPerSecond >= 1) {
    tickResolution = 10;
    labelResolution = 30;
  } else if (pixelsPerSecond >= 0.5) {
    tickResolution = 20;
    labelResolution = 120;
  } else if (pixelsPerSecond >= 0.1) {
    tickResolution = 120;
    labelResolution = 600;
  }

  return {
    tickResolution,
    labelResolution,
  };
}

export const defaultPPS = 20;
