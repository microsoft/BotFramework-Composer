// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import get from 'lodash/get';
import { WidgetContainerProps, WidgetComponent } from '@bfc/extension';
import { LinkBtn } from '@bfc/ui-shared';
import { useEffect, useContext, useRef } from 'react';
import { ILink } from 'office-ui-fabric-react/lib/Link';

import { NodeEventTypes } from '../constants/NodeEventTypes';
import { AttrNames, LinkTag } from '../constants/ElementAttributes';
import { SelectionContext } from '../store/SelectionContext';

export interface DialogRefCardProps extends WidgetContainerProps {
  dialog: string | object;
  getRefContent?: (dialogRef: JSX.Element | null) => JSX.Element;
}

export const DialogRef: WidgetComponent<DialogRefCardProps> = ({ id, onEvent, dialog, getRefContent }) => {
  const linkBtnRef = useRef<ILink>(null);
  const { selectedIds } = useContext(SelectionContext);
  const nodeSelected = selectedIds.includes(`${id}${LinkTag}`);
  const declareElementAttributes = (id: string) => {
    return {
      [AttrNames.SelectableElement]: true,
      [AttrNames.InlineLinkElement]: true,
      [AttrNames.SelectedId]: `${id}${LinkTag}`,
    };
  };
  useEffect(() => {
    if (nodeSelected) {
      linkBtnRef.current?.focus();
    }
  });
  const calleeDialog = typeof dialog === 'object' ? get(dialog, '$ref') : dialog;
  const dialogRef = calleeDialog ? (
    <LinkBtn
      componentRef={linkBtnRef}
      onClick={e => {
        e.stopPropagation();
        onEvent(NodeEventTypes.OpenDialog, { caller: id, callee: calleeDialog });
      }}
      {...declareElementAttributes(id)}
    >
      {calleeDialog}
    </LinkBtn>
  ) : null;
  return typeof getRefContent === 'function' ? getRefContent(dialogRef) : dialogRef;
};
