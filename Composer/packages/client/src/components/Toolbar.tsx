// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { Fragment } from 'react';
import formatMessage from 'format-message';
import { NeutralColors } from '@uifabric/fluent-theme';
import { ActionButton, CommandButton } from 'office-ui-fabric-react/lib/Button';
import { VerticalDivider } from 'office-ui-fabric-react/lib/Divider';
import { IContextualMenuProps, IIconProps } from 'office-ui-fabric-react/lib';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { showProjectTreePanelState } from '../recoilModel';

// -------------------- Styles -------------------- //

export const headerSub = css`
  height: 44px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${NeutralColors.gray30};
`;

export const leftActions = css`
  position: relative;
  display: flex;
  align-items: stretch;
  height: 44px;
`;

export const rightActions = css`
  position: relative;
  display: flex;
  height: 44px;
  margin-right: 20px;
`;

export const actionButton = css`
  font-size: 14px;
  margin-left: 7px;
  height: 44px;
  &:hover {
    background: ${NeutralColors.gray20};
    color: ${NeutralColors.black};
  }
`;

export const expandButton = css`
  font-size: 14px;
  margin: 0;
  padding: 0 7px;
  height: 44px;
  &:hover {
    background: ${NeutralColors.gray20};
    color: ${NeutralColors.black};
  }
`;

export const dividerStyles = {
  divider: {
    height: '32px',
  },
};

// -------------------- IToolbarItem -------------------- //

export type IToolbarItem = {
  type: string;
  element?: React.ReactElement;
  text?: string;
  buttonProps?: {
    iconProps?: IIconProps;
    onClick?: () => void;
  };
  menuProps?: IContextualMenuProps;
  align?: string;
  dataTestid?: string;
  disabled?: boolean;
};

// -------------------- Toolbar -------------------- //

const renderItemList = (item: IToolbarItem, index: number) => {
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
};

type ToolbarProps = {
  toolbarItems?: Array<IToolbarItem>;
};

// support ActionButton or React Elements, the display order is array index.
// action = {type:action/element, text, align, element, buttonProps: use
// fabric-ui IButtonProps interface}
export const Toolbar = (props: ToolbarProps) => {
  const showTreePanel = useRecoilValue(showProjectTreePanelState);
  const setShowTreePanel = useSetRecoilState(showProjectTreePanelState);

  const { toolbarItems = [], ...rest } = props;

  const left: IToolbarItem[] = [];
  const right: IToolbarItem[] = [];

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
      {!showTreePanel ? (
        <div css={leftActions}>
          <ActionButton
            css={expandButton}
            data-testid={'Expand'}
            iconProps={{ iconName: 'DockLeft' }}
            onClick={() => {
              setShowTreePanel(true);
            }}
          ></ActionButton>
          <div css={{ height: '44px' }}>
            <VerticalDivider styles={dividerStyles} />
          </div>
          {left.map(renderItemList)}
        </div>
      ) : (
        <div css={leftActions}>{left.map(renderItemList)}</div>
      )}
      <div css={rightActions}>{right.map(renderItemList)}</div>
    </div>
  );
};
