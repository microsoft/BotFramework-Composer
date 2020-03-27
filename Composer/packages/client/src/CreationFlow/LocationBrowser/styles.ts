// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { mergeStyleSets } from 'office-ui-fabric-react/lib/Styling';
import { FontWeights } from '@uifabric/styling';
import { IDropdownStyles } from 'office-ui-fabric-react/lib/Dropdown';

export const textFieldlabel = {
  root: [
    {
      fontWeight: FontWeights.semibold,
    },
  ],
};

export const dropdown: Partial<IDropdownStyles> = {
  subComponentStyles: {
    label: textFieldlabel,
    panel: {},
    multiSelectItem: {},
  },
  // root: [
  //   {
  //     marginTop: '2rem',
  //   },
  // ],
};

export const backIcon = css`
  font-size: 20px;
  cursor: pointer;
  transform: rotate(90deg);
  width: 20px;
  height: 20px;
  margin: 18px 0px 0px 3px;
  padding: 8px;
  &:hover {
    background-color: rgb(244, 244, 244);
  }
`;

export const detailListContainer = css`
  position: relative;
  padding-top: 20px;
  overflow: hidden;
  flex-grow: 1;
`;

export const fileSelectorContainer = css`
  height: 300px;
  display: flex;
  flex-direction: column;
`;

export const pathNav = css`
  display: flex;
`;

export const loading = css`
  height: 50vh;
  width: 600px;
`;

export const detailListClass = mergeStyleSets({
  fileIconHeaderIcon: {
    padding: 0,
    fontSize: '16px',
  },
  fileIconCell: {
    textAlign: 'center',
    selectors: {
      '&:before': {
        content: '.',
        display: 'inline-block',
        verticalAlign: 'middle',
        height: '100%',
        width: '0px',
        visibility: 'hidden',
      },
    },
  },
  fileIconImg: {
    verticalAlign: 'middle',
    maxHeight: '16px',
    maxWidth: '16px',
  },
});
