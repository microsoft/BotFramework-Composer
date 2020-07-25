// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable security/detect-unsafe-regex */
/* eslint-disable no-bitwise */

const regex = /^#([A-Fa-f0-9]{3}){1,2}$/;

export const hexToRBGA = (hex: string, alpha = 1): string => {
  let c;
  if (regex.test(hex)) {
    c = hex.substring(1).split('');
    if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = Number(`0x${c.join('')}`);

    const rgba = [(c >> 16) & 255, (c >> 8) & 255, c & 255, alpha].join(',');

    return `rgba(${rgba})`;
  }
  return 'rgba(0,0,0,0)';
};

const coerce = (value: number, max: number, min = 0) => {
  return Math.max(Math.min(value, max), min);
};

export const shadeColor = (color: string, percent: number) => {
  percent = coerce(percent, 1, -1);
  const val = parseInt(color.slice(1), 16);
  const t = percent < 0 ? 0 : 255;
  const p = percent < 0 ? percent * -1 : percent;
  const red = val >> 16;
  const green = (val >> 8) & 0x00ff;
  const blue = val & 0x0000ff;
  const hashValue = (
    0x1000000 +
    (Math.round((t - red) * p) + red) * 0x10000 +
    (Math.round((t - green) * p) + green) * 0x100 +
    (Math.round((t - blue) * p) + blue)
  )
    .toString(16)
    .slice(1);

  return `#${hashValue}`;
};
