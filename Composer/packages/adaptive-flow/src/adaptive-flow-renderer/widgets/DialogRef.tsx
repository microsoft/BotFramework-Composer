// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import get from 'lodash/get';
import { LinkBtn, FixedInfo } from '@bfc/ui-shared';
import { useContext } from 'react';
import formatMessage from 'format-message';
import { WidgetContainerProps, WidgetComponent } from '@bfc/extension-client';

import { NodeEventTypes } from '../constants/NodeEventTypes';
import { RendererContext } from '../contexts/RendererContext';
import { ElementWrapperTag } from '../types/PluggableComponents.types';

export interface DialogRefCardProps extends WidgetContainerProps {
  dialog: string | object;
}

export const DialogRef: WidgetComponent<DialogRefCardProps> = ({ id, onEvent, dialog }) => {
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
  ) : (
    '?'
  );
  return (
    <div>
      {dialogRef} <FixedInfo>{formatMessage('(Dialog)')}</FixedInfo>
    </div>
  );
};
