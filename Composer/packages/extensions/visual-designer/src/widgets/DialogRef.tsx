// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import get from 'lodash/get';

import { LinkBtn } from '../components/elements/styledComponents';
import { WidgetContainerProps, WidgetComponent } from '../schema/uischema.types';
import { NodeEventTypes } from '../constants/NodeEventTypes';

export interface DialogRefCardProps extends WidgetContainerProps {
  dialog: string | object;
  getRefContent?: (dialogRef: JSX.Element) => JSX.Element;
}

export const DialogRef: WidgetComponent<DialogRefCardProps> = ({ id, onEvent, dialog, getRefContent }) => {
  const calleeDialog = typeof dialog === 'object' ? get(dialog, '$ref') : dialog;
  const dialogRef = (
    <LinkBtn
      onClick={e => {
        e.stopPropagation();
        onEvent(NodeEventTypes.OpenDialog, { caller: id, callee: calleeDialog });
      }}
    >
      {calleeDialog}
    </LinkBtn>
  );
  return typeof getRefContent === 'function' ? getRefContent(dialogRef) : dialogRef;
};
