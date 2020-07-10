// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment } from 'react';
import formatMessage from 'format-message';
import { ActionButton, CommandButton } from 'office-ui-fabric-react/lib/Button';

import { IToolBarItem } from './ToolBar.types';
import { actionButton, leftActions, rightActions, headerSub } from './ToolBarStyles';

type ToolbarProps = {
  toolbarItems?: Array<IToolBarItem>;
};

function itemList(item: IToolBarItem, index: number) {
  if (item.type === 'element') {
    return <Fragment key={index}>{item.element}</Fragment>;
  } else if (item.type === 'action') {
    return (
      <ActionButton
        key={index}
        css={actionButton}
        {...item.buttonProps}
        data-testid={item.dataTestid}
        disabled={item.disabled}
      >
        {item.text}
      </ActionButton>
    );
  } else if (item.type === 'dropdown') {
    return (
      <CommandButton
        key={index}
        css={actionButton}
        data-testid={item.dataTestid}
        disabled={item.disabled}
        iconProps={item.buttonProps?.iconProps}
        menuProps={item.menuProps}
        text={item.text}
      />
    );
  } else {
    return null;
  }
}

// support ActionButton or React Elements, the display order is array index.
// action = {type:action/element, text, align, element, buttonProps: use
// fabric-ui IButtonProps interface}
export function ToolBar(props: ToolbarProps) {
  const { toolbarItems = [], ...rest } = props;

  const left: IToolBarItem[] = [];
  const right: IToolBarItem[] = [];

  for (const item of toolbarItems) {
    switch (item.align) {
      case 'left':
        left.push(item);
        break;
      case 'right':
        right.push(item);
    }
  }

  return (
    <div aria-label={formatMessage('toolbar')} css={headerSub} role="region" {...rest}>
      <div css={leftActions}>{left.map(itemList)} </div>
      <div css={rightActions}>{right.map(itemList)}</div>
    </div>
  );
}
