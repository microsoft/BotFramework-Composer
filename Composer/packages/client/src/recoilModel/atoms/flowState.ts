// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { atom } from 'recoil';
import { ZoomInfo } from '@bfc/shared';

const getFullyQualifiedKey = (value: string) => {
  return `Zoom_${value}_State`;
};

export const rateInfoState = atom<ZoomInfo>({
  key: getFullyQualifiedKey('rateInfo'),
  default: {
    rateList: [0.25, 0.33, 0.5, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.75, 2, 2.5, 3, 4, 5],
    maxRate: 3,
    minRate: 0.5,
    currentRate: 1,
  },
});

export const flowCommentsVisibilityState = atom<boolean>({
  key: getFullyQualifiedKey('flowCommentsVisibility'),
  default: true,
});
