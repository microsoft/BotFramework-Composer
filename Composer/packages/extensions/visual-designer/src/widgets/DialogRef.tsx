// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import get from 'lodash/get';
import { WidgetContainerProps, WidgetComponent } from '@bfc/extension';
import { LinkBtn } from '@bfc/ui-shared';

import { NodeEventTypes } from '../constants/NodeEventTypes';

export interface DialogRefCardProps extends WidgetContainerProps {
  dialog: string | object;
  getRefContent?: (dialogRef: JSX.Element | null) => JSX.Element;
}

export const DialogRef: WidgetComponent<DialogRefCardProps> = ({ id, onEvent, dialog, getRefContent }) => {
  const calleeDialog = typeof dialog === 'object' ? get(dialog, '$ref') : dialog;
  const dialogRef = calleeDialog ? (
    <LinkBtn
      onClick={(e) => {
        e.stopPropagation();
        onEvent(NodeEventTypes.OpenDialog, { caller: id, callee: calleeDialog });
      }}
    >
      {calleeDialog}
    </LinkBtn>
  ) : null;
  return typeof getRefContent === 'function' ? getRefContent(dialogRef) : dialogRef;
};
