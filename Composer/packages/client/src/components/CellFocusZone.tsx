// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import React, { useCallback } from 'react';
import { FocusZone, FocusZoneTabbableElements, IFocusZoneProps } from '@fluentui/react/lib/FocusZone';
import { getFocusStyle, getTheme, mergeStyles } from '@fluentui/react/lib/Styling';

import { useAfterRender } from '../hooks/useAfterRender';

export const formCell = css`
  outline: none;
  white-space: pre-wrap;
  font-size: 14px;
  line-height: 28px;
`;

export const formCellFocus = mergeStyles(
  getFocusStyle(getTheme(), {
    inset: -3,
  })
);

/**
 * CellFocusZone component props.
 * Props are intently omitted as they're required for component to function correctly.
 * Please manually test the component using keyboard in places it is used in case any changes made.
 */
type CellFocusZoneProps = Omit<
  React.HTMLAttributes<unknown> & IFocusZoneProps,
  | 'allowFocusRoot'
  | 'data-is-focusable'
  | 'isCircularNavigation'
  | 'className'
  | 'handleTabKey'
  | 'shouldFocusInnerElementWhenReceivedFocus'
  | 'tabIndex'
  | 'onBlur'
  | 'onKeyDown'
>;

const CellFocusZone: React.FC<CellFocusZoneProps> = (props) => {
  const onAfterRender = useAfterRender();
  const focusCurrentZoneAfterRender = useCallback((focusZoneEl: any) => {
    const focusZoneId = focusZoneEl?.dataset?.focuszoneId;
    if (!focusZoneId) {
      return;
    }
    // wait for render to happen before placing focus back to the focus zone
    onAfterRender(() => {
      const focusZone: HTMLElement | null = document.querySelector(`[data-focuszone-id=${focusZoneId}]`);
      focusZone?.focus();
    });
  }, []);

  const onCellKeyDown = useCallback((ev) => {
    // ignore any of events coming from input fields
    if (ev.target.localName === 'input' || ev.target.localName === 'textarea') {
      ev.stopPropagation();
      return;
    }

    // enter inside cell using Enter key
    if (ev.target.dataset.focuszoneId && ev.key === 'Enter') {
      const input: HTMLElement | null = (ev?.target as HTMLElement)?.querySelector('a, button, input, textarea');
      input?.focus();
      return;
    }

    // handle uncaught escape key events to allow returning back to navigation between cells
    if (ev.key === 'Escape') {
      ev.stopPropagation();
      focusCurrentZoneAfterRender(ev.currentTarget);
    }
  }, []);

  const onCellInnerBlur = useCallback((ev) => {
    // this means we dont have an element to focus so we place focus back to the cell
    if (!ev.relatedTarget) {
      focusCurrentZoneAfterRender(ev.currentTarget);
    }
  }, []);

  return (
    <FocusZone
      css={formCell}
      {...props}
      allowFocusRoot
      data-is-focusable
      isCircularNavigation
      className={formCellFocus}
      handleTabKey={FocusZoneTabbableElements.all}
      shouldFocusInnerElementWhenReceivedFocus={false}
      tabIndex={0}
      onBlur={onCellInnerBlur}
      onKeyDown={onCellKeyDown}
    >
      {props.children}
    </FocusZone>
  );
};

export { CellFocusZone };
