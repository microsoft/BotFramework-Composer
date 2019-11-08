// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IModalStyleProps, IModalStyles, IStyleFunctionOrObject } from 'office-ui-fabric-react';

import { palette } from '../palette';

export const collapsedStyles: IStyleFunctionOrObject<IModalStyleProps, IModalStyles> = {
  main: {
    backgroundColor: palette.themePrimary,
    bottom: '30px',
    color: 'white',
    paddingLeft: '15px',
    position: 'absolute',
    right: '20px',
  },
};

export const expandedStyles: IStyleFunctionOrObject<IModalStyleProps, IModalStyles> = {
  main: {
    bottom: '30px',
    padding: '15px',
    position: 'absolute',
    right: '30px',
  },
};
