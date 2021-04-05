// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import get from 'lodash/get';
import { LinkBtn, FixedInfo } from '@bfc/ui-shared';
import { useContext, useMemo } from 'react';
import formatMessage from 'format-message';
import { WidgetContainerProps, WidgetComponent } from '@bfc/extension-client';
import { Icon } from 'office-ui-fabric-react/lib/Icon';

import { NodeEventTypes } from '../constants/NodeEventTypes';
import { RendererContext } from '../contexts/RendererContext';
import { ElementWrapperTag } from '../types/PluggableComponents.types';
import { NodeRendererContext } from '../../adaptive-flow-editor/contexts/NodeRendererContext';

export interface DialogRefCardProps extends WidgetContainerProps {
  dialog: string | object;
}

export const DialogRef: WidgetComponent<DialogRefCardProps> = ({ id, onEvent, dialog, data }) => {
  const { ElementWrapper } = useContext(RendererContext);
  const { dialogs, topics } = useContext(NodeRendererContext);
  const calleeDialog = typeof dialog === 'object' ? get(dialog, '$ref') : dialog;

  const isTopic = useMemo(() => {
    return topics.some((t) => t.content?.id === calleeDialog);
  }, [dialog]);

  const linkContent = useMemo(() => {
    if (isTopic) {
      const topic = topics.find((t) => t.content?.id === calleeDialog);
      return (
        <React.Fragment>
          {get(topic?.content, '$designer.name') || calleeDialog}
          &nbsp;
          <Icon iconName="NavigateExternalInline" />
        </React.Fragment>
      );
    }

    const dialogData = dialogs.find((d) => d.id === calleeDialog);

    if (dialogData) {
      return get(dialogData.content, '$designer.name') || calleeDialog;
    }

    return calleeDialog;
  }, [dialog]);

  const fixedInfoContent = useMemo(() => {
    if (isTopic) {
      return formatMessage('(Topic)');
    }

    return formatMessage('(Dialog)');
  }, [dialog]);

  const dialogRef = calleeDialog ? (
    <ElementWrapper nodeId={id} tagId={ElementWrapperTag.Link}>
      <LinkBtn
        onClick={(e) => {
          e.stopPropagation();
          onEvent(NodeEventTypes.OpenDialog, { caller: id, callee: calleeDialog });
        }}
      >
        {linkContent}
      </LinkBtn>
    </ElementWrapper>
  ) : (
    '?'
  );
  return (
    <div>
      {dialogRef} <FixedInfo>{fixedInfoContent}</FixedInfo>
    </div>
  );
};
