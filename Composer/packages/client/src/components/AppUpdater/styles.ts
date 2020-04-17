// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { IButtonStyles } from 'office-ui-fabric-react/lib/Button';
import { IDialogContentStyles, IDialogFooterStyles } from 'office-ui-fabric-react/lib/Dialog';
import { IModalStyles } from 'office-ui-fabric-react/lib/Modal';

export const optionIcon = checked => css`
  vertical-align: text-bottom;
  font-size: 18px;
  margin-right: 10px;
  color: ${checked ? '#0078d4' : '#000'};
`;

export const optionRoot = css`
  width: 100%;
  height: 100%;
`;

export const dialogCopy = css`
  margin: 0px;
  color: #000;
`;

export const modal: Partial<IModalStyles> = {
  main: {
    maxWidth: '427px !important',
    width: '427px !important',
  },
};

export const dialogContent: Partial<IDialogContentStyles> = {
  subText: { color: '#000' },
  header: { paddingBottom: '6px' },
};

export const dialogFooter: Partial<IDialogFooterStyles> = {
  actions: {
    marginTop: '46px',
  },
};

export const updateAvailableDismissBtn: Partial<IButtonStyles> = {
  root: {
    marginRight: '6px;',
  },
};
