// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import get from 'lodash/get';
import { WidgetContainerProps, WidgetComponent } from '@bfc/extension';
import { LinkBtn } from '@bfc/ui-shared';
import { useContext, useRef, useEffect } from 'react';

import { NodeEventTypes } from '../constants/NodeEventTypes';
import { AttrNames, LinkTag } from '../../composer-flow-editor/constants/ElementAttributes';
import { SelectionContext } from '../../composer-flow-editor/contexts/SelectionContext';
import { ElementWrapperComponent } from '../types/PluggableComponents.types';

export interface DialogRefCardProps extends WidgetContainerProps {
  dialog: string | object;
  getRefContent?: (dialogRef: JSX.Element | null) => JSX.Element;
}

const ElementWrapper: ElementWrapperComponent = ({ nodeId, tagId, children }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const { selectedIds } = useContext(SelectionContext);
  const elementId = `${nodeId}${tagId}`;
  const elementAttributes = {
    [AttrNames.SelectableElement]: true,
    [AttrNames.InlineLinkElement]: true,
    [AttrNames.SelectedId]: elementId,
  };

  const selected = selectedIds.includes(elementId);
  useEffect(() => {
    if (!selected || !divRef.current) return;

    const childRef = divRef.current.firstElementChild;
    if (tagId === LinkTag) {
      // try focus a link
      childRef &&
        typeof (childRef as HTMLButtonElement).focus === 'function' &&
        (childRef as HTMLButtonElement).focus();
    }
  });

  return (
    <div
      ref={divRef}
      css={css`
        display: inline-block;
      `}
      {...elementAttributes}
    >
      {children}
    </div>
  );
};

export const DialogRef: WidgetComponent<DialogRefCardProps> = ({ id, onEvent, dialog, getRefContent }) => {
  const calleeDialog = typeof dialog === 'object' ? get(dialog, '$ref') : dialog;
  const dialogRef = calleeDialog ? (
    <ElementWrapper nodeId={id} tagId={LinkTag}>
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
