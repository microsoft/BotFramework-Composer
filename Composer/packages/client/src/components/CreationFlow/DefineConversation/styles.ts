// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FontWeights } from '@uifabric/styling';

export const textFieldlabel = {
  label: {
    root: [
      {
        fontWeight: FontWeights.semibold,
      },
    ],
  },
};

export const name = {
  subComponentStyles: textFieldlabel,
};

export const description = {
  subComponentStyles: textFieldlabel,
};

export const locationBrowse = {
  root: {
    marginTop: '20px',
  },
  subComponentStyles: textFieldlabel,
};

export const locationOnly = {
  subComponentStyles: textFieldlabel,
};
