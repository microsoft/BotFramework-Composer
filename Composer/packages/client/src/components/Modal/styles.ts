// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { FontSizes, SharedColors } from '@uifabric/fluent-theme';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { IDialogContentStyles } from 'office-ui-fabric-react/lib/Dialog';
import { IModalStyles } from 'office-ui-fabric-react/lib/Modal';

import { dialogStyle } from './dialogStyle';

export const displayManifest: { content: any; dialog: Partial<IDialogContentStyles>; modal: Partial<IModalStyles> } = {
  content: css`
    height: 675px;
    padding-bottom: 4px;
  `,
  dialog: {
    title: {
      fontSize: FontSizes.size20,
      fontWeight: FontWeights.bold,
      paddingBottom: '11px',
      paddingTop: '14px',
    },
  },
  modal: {
    main: {
      height: '800px !important',
      maxWidth: '80% !important',
      width: '600px !important',
    },
  },
};

export const builtInStyles = {
  [dialogStyle.normal]: css`
    padding: 15px;
    margin-bottom: 20px;
    white-space: pre-line;
  `,
  [dialogStyle.console]: css`
    background: #000;
    max-height: 90px;
    overflow-y: auto;
    font-size: 16px;
    line-height: 23px;
    color: #fff;
    padding: 10px 15px;
    margin-bottom: 20px;
    white-space: pre-line;
  `,
};

export const dialog = {
  title: {
    fontWeight: FontWeights.bold,
  },
};

export const dialogModal = {
  main: {
    maxWidth: '600px !important',
  },
};

export const confirmationContainer = css`
  display: flex;
  flex-direction: column;
`;

export const confirmation = css`
  padding: 15px;
  margin-bottom: 20px;
  white-space: pre-line;
  background: ${SharedColors.red10};
`;

export const confirmationContent = css`
  width: 500px;
`;
