// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { FontSizes } from '@uifabric/fluent-theme';
import { css } from '@emotion/core';

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
    height: 500px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

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
};
