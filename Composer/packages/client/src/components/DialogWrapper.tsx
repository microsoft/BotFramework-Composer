// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useState } from 'react';
import { Dialog, DialogType, IDialogProps } from 'office-ui-fabric-react/lib/Dialog';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { FontSizes } from '@uifabric/fluent-theme';
import { IDialogContentStyles } from 'office-ui-fabric-react/lib/Dialog';
import { IModalStyles } from 'office-ui-fabric-react/lib/Modal';

export enum DialogTypes {
  CreateFlow,
  DesignFlow,
}

// -------------------- Styles -------------------- //

const styles: {
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

interface DialogWrapperProps extends Pick<IDialogProps, 'onDismiss' | 'isBlocking'> {
  isOpen: boolean;
  title: string;
  subText: string;
  dialogType: DialogTypes;
}

export const DialogWrapper: React.FC<DialogWrapperProps> = (props) => {
  const { isOpen, onDismiss, title, subText, children, dialogType, isBlocking } = props;
  const [currentStyle, setStyle] = useState(styles[dialogType]);

  useEffect(() => {
    if (dialogType) {
      setStyle(styles[dialogType]);
    }
  }, [dialogType]);

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog
      dialogContentProps={{
        type: DialogType.normal,
        title: title,
        subText: subText,
        styles: currentStyle.dialog,
      }}
      hidden={false}
      modalProps={{
        isBlocking: isBlocking ? true : false,
        styles: currentStyle.modal,
      }}
      onDismiss={onDismiss}
    >
      {children}
    </Dialog>
  );
};
