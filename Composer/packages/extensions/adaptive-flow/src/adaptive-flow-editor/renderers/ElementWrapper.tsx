// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { useRef, useContext, useEffect } from 'react';

import { SelectionContext } from '../contexts/SelectionContext';
import { AttrNames } from '../constants/ElementAttributes';
import {
  ElementWrapperComponent,
  ElementWrapperTag,
} from '../../adaptive-flow-renderer/types/PluggableComponents.types';

export const ElementWrapper: ElementWrapperComponent = ({ nodeId, tagId, children }) => {
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
    if (tagId === ElementWrapperTag.Link) {
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
