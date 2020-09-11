// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import get from 'lodash/get';
import { LinkBtn } from '@bfc/ui-shared';
import { useContext } from 'react';

import { WidgetContainerProps, WidgetComponent } from '../types/flowRenderer.types';
import { NodeEventTypes } from '../constants/NodeEventTypes';
import { RendererContext } from '../contexts/RendererContext';
import { ElementWrapperTag } from '../types/PluggableComponents.types';

export interface DialogRefCardProps extends WidgetContainerProps {
  dialog: string | object;
  getRefContent?: (dialogRef: JSX.Element | null) => JSX.Element;
}

export const DialogRef: WidgetComponent<DialogRefCardProps> = ({ id, onEvent, dialog, getRefContent }) => {
  const { ElementWrapper } = useContext(RendererContext);
  const calleeDialog = typeof dialog === 'object' ? get(dialog, '$ref') : dialog;
  const dialogRef = calleeDialog ? (
    <ElementWrapper nodeId={id} tagId={ElementWrapperTag.Link}>
      <LinkBtn
        onClick={(e) => {
          e.stopPropagation();
          onEvent(NodeEventTypes.OpenDialog, { caller: id, callee: calleeDialog });
        }}
      >
        {calleeDialog}
      </LinkBtn>
    </ElementWrapper>
  ) : null;
  return typeof getRefContent === 'function' ? getRefContent(dialogRef) : dialogRef;
};
