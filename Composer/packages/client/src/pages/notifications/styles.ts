// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { mergeStyleSets } from 'office-ui-fabric-react/lib/Styling';
import { css } from '@emotion/core';
import { IDropdownStyles } from 'office-ui-fabric-react';

export const icons = {
  Error: { iconName: 'ErrorBadge', color: '#A80000', background: '#FED9CC' },
  Warning: { iconName: 'Warning', color: '#8A8780', background: '#FFF4CE' },
};

export const notification = mergeStyleSets({
  typeIconHeaderIcon: {
    padding: 0,
    fontSize: '16px',
  },
  typeIconCell: {
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
});

export const dropdownStyles: Partial<IDropdownStyles> = {
  dropdown: { width: 180, marginLeft: 'auto' },
};

export const typeIcon = icon => css`
  vertical-align: middle;
  font-size: 16px;
  width: 24px;
  height: 24px;
  background: ${icon.background};
  line-height: 24px;
  color: ${icon.color};
`;

export const notificationHeader = css`
  border-bottom: 1px solid #edebe9;
  height: 90px;
  padding: 14px 38px 8px 29px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

export const notificationHeaderText = css`
  font-size: 20px;
  color: #323130;
  font-weight: bold;
`;

export const root = css`
  display: flex;
  height: 100%;
  flex-direction: column;
`;

export const listRoot = css`
  overflow-y: auto;
`;
