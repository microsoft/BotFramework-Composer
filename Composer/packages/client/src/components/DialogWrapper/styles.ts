// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { FontSizes } from '@uifabric/fluent-theme';
import { IDialogContentStyles } from 'office-ui-fabric-react/lib/Dialog';
import { IModalStyles } from 'office-ui-fabric-react/lib/Modal';

export enum DialogTypes {
  CreateFlow,
  DesignFlow,
}

export const styles: {
  [DialogTypes.DesignFlow]: { dialog: Partial<IDialogContentStyles>; modal: Partial<IModalStyles> };
  [DialogTypes.CreateFlow]: { dialog: Partial<IDialogContentStyles>; modal: Partial<IModalStyles> };
} = {
  [DialogTypes.CreateFlow]: {
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
        // maxWidth: '416px !important',
        maxWidth: '80% !important',
        width: '960px !important',
      },
    },
  },
  [DialogTypes.DesignFlow]: {
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
  },
};
