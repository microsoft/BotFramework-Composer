// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { FontSizes } from '@uifabric/fluent-theme';
import { IDialogContentStyles } from 'office-ui-fabric-react/lib/Dialog';
import { IModalStyles } from 'office-ui-fabric-react/lib/Modal';

export const styles: { dialog: Partial<IDialogContentStyles>; modal: Partial<IModalStyles> } = {
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
      maxWidth: '416px !important',
    },
  },
};
