// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { FontSizes } from '@uifabric/fluent-theme';
import { IDialogContentStyles } from 'office-ui-fabric-react/lib/Dialog';
import { IModalStyles } from 'office-ui-fabric-react/lib/Modal';
import { css } from '@emotion/core';

export const styles: { dialog: Partial<IDialogContentStyles>; modal: Partial<IModalStyles>; [key: string]: any } = {
  dialog: {
    title: {
      fontWeight: FontWeights.bold,
      fontSize: FontSizes.size20,
      paddingTop: '14px',
      paddingBottom: '11px',
    },
    subText: {
      fontSize: FontSizes.size14,
    },
  },
  modal: {
    main: {
      height: '600px !important',
      maxWidth: '80% !important',
      width: '960px !important',
    },
  },
  container: css`
    height: 520px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    label: ContentContainer;
  `,
  content: css`
    flex: 1;

    label: Content;
  `,
  buttonContainer: css`
    display: flex;
    flex-direction: row-reverse;
    justify-content: space-between;
  `,
};
