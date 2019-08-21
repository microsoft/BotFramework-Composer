import React, { Fragment } from 'react';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';

import { headerSub, leftActions, rightActions, actionButton } from './styles';

function itemList(action, index) {
  if (action.type === 'element') {
    return <Fragment key={index}>{action.element}</Fragment>;
  } else {
    return (
      <ActionButton key={index} css={actionButton} {...action.buttonProps} data-testid={action.dataTestid}>
        {action.text}
      </ActionButton>
    );
  }
}
// support ActionButton or React Elements, the display order is array index.
// action = {type:action/element, text, align, element, buttonProps: use
// fabric-ui IButtonProps interface}
export function ToolBar(props) {
  const { toolbarItems, ...rest } = props;
  let left = [];
  let right = [];
  if (toolbarItems && toolbarItems.length > 0) {
    left = toolbarItems.filter(item => {
      return item.align === 'left';
    });
    right = toolbarItems.filter(item => {
      return item.align === 'right';
    });
  }
  return (
    <div css={headerSub} {...rest}>
      <div css={leftActions}>{left.map(itemList)}</div>
      <div css={rightActions}>{right.map(itemList)}</div>
    </div>
  );
}
