// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FontWeights } from '@fluentui/react/lib/Styling';
import { FontSizes } from '@fluentui/theme';
import { css } from '@emotion/react';

export const styles = {
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
      maxWidth: '80% !important',
      width: '960px !important',
    },
    scrollableContent: {
      overflow: 'hidden' as 'hidden',
    },
  },
  container: css`
    height: calc(100vh - 170px);
    max-height: 500px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: auto;

    label: ContentContainer;
  `,
  content: {
    flex: 1,

    label: 'Content',
  },
  buttonContainer: css`
    display: flex;
    flex-direction: row-reverse;
    justify-content: space-between;
  `,
  buttonsRight: css`
    display: flex;
  `,
};
