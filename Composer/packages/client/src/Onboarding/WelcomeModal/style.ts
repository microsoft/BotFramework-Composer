// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IModalStyles } from 'office-ui-fabric-react/lib/Modal';

import { palette } from '../palette';

export const collapsedStyles: Partial<IModalStyles> = {
  main: {
    backgroundColor: palette.themePrimary,
    bottom: '30px',
    minHeight: '55px',
    color: 'white',
    paddingLeft: '15px',
    position: 'absolute',
    right: '20px',
  },
};

export const expandedStyles: Partial<IModalStyles> = {
  main: {
    bottom: '30px',
    padding: '15px',
    position: 'absolute',
    right: '30px',
  },
};
