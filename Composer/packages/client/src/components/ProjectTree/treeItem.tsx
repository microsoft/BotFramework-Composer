// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React from 'react';
import { FontWeights } from '@uifabric/styling';
import { OverflowSet, IOverflowSetItemProps } from 'office-ui-fabric-react/lib/OverflowSet';
import { TooltipHost, DirectionalHint } from 'office-ui-fabric-react/lib/Tooltip';
import { ContextualMenuItemType, IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import formatMessage from 'format-message';
import { NeutralColors } from '@uifabric/fluent-theme';
import { IButtonStyles } from 'office-ui-fabric-react/lib/Button';
import { IContextualMenuStyles } from 'office-ui-fabric-react/lib/ContextualMenu';
import { ICalloutContentStyles } from 'office-ui-fabric-react/lib/Callout';

import { TreeLink, TreeMenuItem } from './ProjectTree';
import { SUMMARY_ARROW_SPACE } from './constants';

// -------------------- Styles -------------------- //

const iconAndText = css`
  outline: none;
  :focus {
    outline: rgb(102, 102, 102) solid 1px;
    z-index: 1;
  }
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  text-align: left;
  cursor: pointer;
  width: 100%;

  label: ProjectTreeItemContainer;
`;

const content = css`
  outline: none;
  display: flex;
  align-items: center;
  height: 24px;

  label: ProjectTreeItem;
`;

const moreMenu: Partial<ICalloutContentStyles> = {
  root: {
    marginTop: '-1px',
  },
};

const menuStyle: Partial<IContextualMenuStyles> = {
  subComponentStyles: {
    menuItem: {},
    callout: moreMenu,
  },
};

const moreButton = (isActive: boolean): IButtonStyles => {
  return {
    root: {
      padding: '4px 4px 0 4px',
      alignSelf: 'stretch',
      visibility: isActive ? 'visible' : 'hidden',
      height: 'auto',
      width: '16px',
    },
    menuIcon: {
      fontSize: '14px',
      color: '#000',
    },
  };
};

const navItem = (isActive: boolean) => css`
  label: navItem;
  min-width: 100%;
  position: relative;
  height: 24px;
  font-size: 12px;
  color: ${isActive ? '#ffffff' : '#545454'};
  background: ${isActive ? '#0078d4' : 'transparent'};
  font-weight: ${isActive ? FontWeights.semibold : FontWeights.regular};

  display: flex;
  flex-direction: row;
  align-items: center;

  &:hover {
    color: #545454;
    background: #f2f2f2;

    .dialog-more-btn {
      visibility: visible;
    }
  }

  &:focus {
    outline: none;
    .ms-Fabric--isFocusVisible &::after {
      top: 0px;
      right: 1px;
      bottom: 0px;
      left: 1px;
      content: '';
      position: absolute;
      z-index: 1;
      border: 1px solid ${NeutralColors.white};
      border-image: initial;
      outline: rgb(102, 102, 102) solid 1px;
    }
  }
`;

export const overflowSet = css`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  line-height: 24px;
  justify-content: space-between;
  display: flex;
  margin-top: 2px;
`;

const statusIcon = {
  width: '12px',
  height: '18px',
  fontSize: 11,
  marginLeft: 6,
};

const warningIcon = {
  ...statusIcon,
  color: '#BE880A',
};

const errorIcon = {
  ...statusIcon,
  color: '#CC3F3F',
};

const itemName = (nameWidth: number) => css`
  max-width: ${nameWidth}px;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 1;
`;

// -------------------- TreeItem -------------------- //

interface ITreeItemProps {
  link: TreeLink;
  isActive?: boolean;
  isSubItemActive?: boolean;
  menu?: TreeMenuItem[];
  onSelect?: (link: TreeLink) => void;
  icon?: string;
  dialogName?: string;
  showProps?: boolean;
  textWidth?: number;
  extraSpace?: number;
  hasChildren?: boolean;
}

const renderTreeMenuItem = (link: TreeLink) => (item: TreeMenuItem) => {
  if (item.label === '') {
    return {
      key: 'divider',
      itemType: ContextualMenuItemType.Divider,
    };
  }
  return {
    key: item.label,
    ariaLabel: item.label,
    text: item.label,
    iconProps: { iconName: item.icon },
    onClick: () => {
      item.onClick?.(link);
    },
  };
};

const onRenderItem = (textWidth: number) => (item: IOverflowSetItemProps) => {
  const { warningContent, errorContent } = item;
  return (
    <div
      data-is-focusable
      aria-label={`${item.displayName} ${warningContent ?? ''} ${errorContent ?? ''}`}
      css={iconAndText}
      role="cell"
      tabIndex={0}
      onBlur={item.onBlur}
      onFocus={item.onFocus}
    >
      <div css={content} role="presentation" tabIndex={-1}>
        {item.icon != null && (
          <Icon
            iconName={item.icon}
            styles={{
              root: {
                width: '12px',
                marginRight: '8px',
                outline: 'none',
              },
            }}
            tabIndex={-1}
          />
        )}
        <span css={itemName(textWidth)}>{item.displayName}</span>
        {item.errorContent && (
          <TooltipHost content={item.errorContent} directionalHint={DirectionalHint.bottomLeftEdge}>
            <Icon iconName={'WarningSolid'} style={warningIcon} />
          </TooltipHost>
        )}
        {item.warningContent && (
          <TooltipHost content={item.warningContent} directionalHint={DirectionalHint.bottomLeftEdge}>
            <Icon iconName={'StatusErrorFull'} style={errorIcon} />
          </TooltipHost>
        )}
      </div>
    </div>
  );
};

const onRenderOverflowButton = (isActive: boolean) => {
  const moreLabel = formatMessage('Actions');
  return (overflowItems: IContextualMenuItem[] | undefined) => {
    if (overflowItems == null) return null;
    return (
      <TooltipHost content={moreLabel} directionalHint={DirectionalHint.rightCenter}>
        <IconButton
          ariaLabel={moreLabel}
          className="dialog-more-btn"
          data-is-focusable={isActive}
          data-testid="dialogMoreButton"
          menuIconProps={{ iconName: 'MoreVertical' }}
          menuProps={{ items: overflowItems, styles: menuStyle }}
          role="cell"
          styles={moreButton(isActive)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.stopPropagation();
            }
          }}
        />
      </TooltipHost>
    );
  };
};

export const TreeItem: React.FC<ITreeItemProps> = ({
  link,
  isActive = false,
  icon,
  dialogName,
  onSelect,
  textWidth = 100,
  hasChildren = false,
  menu = [],
  extraSpace = 0,
}) => {
  const a11yLabel = `${dialogName ?? '$Root'}_${link.displayName}`;

  const overflowMenu = menu.map(renderTreeMenuItem(link));

  const linkString = `${link.projectId}_DialogTreeItem${link.dialogId}_${link.trigger ?? ''}`;
  const spacerWidth = hasChildren ? 0 : SUMMARY_ARROW_SPACE + extraSpace;

  return (
    <div
      aria-label={a11yLabel}
      css={navItem(isActive)}
      data-testid={a11yLabel}
      role="gridcell"
      tabIndex={0}
      onClick={() => {
        onSelect?.(link);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onSelect?.(link);
        }
      }}
    >
      <div style={{ minWidth: `${spacerWidth}px` }}></div>
      <OverflowSet
        //In 8.0 the OverflowSet will no longer be wrapped in a FocusZone
        //remove this at that time
        doNotContainWithinFocusZone
        css={overflowSet}
        data-testid={linkString}
        items={[
          {
            key: linkString,
            icon,
            ...link,
          },
        ]}
        overflowItems={overflowMenu}
        role="row"
        styles={{ item: { flex: 1 } }}
        onRenderItem={onRenderItem(textWidth - spacerWidth + extraSpace)}
        onRenderOverflowButton={onRenderOverflowButton(!!isActive)}
      />
    </div>
  );
};
