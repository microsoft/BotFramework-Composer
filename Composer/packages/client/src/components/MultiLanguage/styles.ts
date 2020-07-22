// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FontSizes, getTheme, mergeStyleSets } from 'office-ui-fabric-react/lib/Styling';
import { css } from '@emotion/core';

const theme = getTheme();

export const FormModalBody = css`
  padding: 24px;
`;

export const MarginLeftSmall = css`
  margin-left: ${FontSizes.small};
`;

export const SpinnerLabel = css`
  justify-content: left;
  margin-top: 0.4rem;
`;

export const classNames = mergeStyleSets({
  pane: {
    maxWidth: 400,
    height: 150,
    padding: 10,
    marginTop: 10,
    position: 'relative',
    border: '1px solid ' + theme.palette.neutralLight,
  },
  checkboxItem: {
    padding: 10,
  },
  checkboxSwitchToNew: {
    marginLeft: 10,
  },
  form: {
    padding: '0',
  },
  confirmBtn: {
    float: 'right',
    marginLeft: '14px',
  },
});
