/** @jsx jsx */
import { jsx } from '@emotion/core';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';

import { headerSub, leftActions, rightActions, actionButton } from './styles';

function itemList(action, index) {
  if (action.isElement) {
    return action.element;
  } else {
    return (
      <ActionButton
        key={index}
        css={actionButton}
        iconProps={{
          iconName: action.iconName,
        }}
        onClick={event => action.onClick(event, action)}
      >
        {action.text}
      </ActionButton>
    );
  }
}
// support ActionButton or React Elements, the display order is array index.
// action = {isElement, iconName, text, onClick, align, element}
export function ToolBar(props) {
  const { toolbarItems } = props;
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
    <div css={headerSub}>
      <div css={leftActions}>{left.map(itemList)}</div>
      <div css={rightActions}>{right.map(itemList)}</div>
    </div>
  );
}
