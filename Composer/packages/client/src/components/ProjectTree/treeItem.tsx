// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React from 'react';
import { FontWeights } from '@uifabric/styling';
import { FontSizes } from '@uifabric/fluent-theme';
import { OverflowSet, IOverflowSetItemProps } from 'office-ui-fabric-react/lib/OverflowSet';
import { TooltipHost, DirectionalHint } from 'office-ui-fabric-react/lib/Tooltip';
import { ContextualMenuItemType, IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import formatMessage from 'format-message';
import { NeutralColors, SharedColors } from '@uifabric/fluent-theme';
import { IButtonStyles } from 'office-ui-fabric-react/lib/Button';
import { IContextualMenuStyles } from 'office-ui-fabric-react/lib/ContextualMenu';
import { ICalloutContentStyles } from 'office-ui-fabric-react/lib/Callout';
import { DiagnosticSeverity, Diagnostic } from '@bfc/shared';

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

export const moreMenu: Partial<ICalloutContentStyles> = {
  root: {
    marginTop: '-1px',
  },
};

export const menuStyle: Partial<IContextualMenuStyles> = {
  subComponentStyles: {
    menuItem: {},
    callout: moreMenu,
  },
};

export const moreButton = (isActive: boolean): IButtonStyles => {
  return {
    root: {
      padding: '4px 4px 0 4px',
      alignSelf: 'stretch',
      visibility: isActive ? 'visible' : 'hidden',
      height: 'auto',
      width: '16px',
      color: '#000',
    },
    menuIcon: {
      fontSize: '12px',
      color: '#000',
    },
  };
};

const navItem = (isActive: boolean, isBroken: boolean) => css`
  label: navItem;
  min-width: 100%;
  position: relative;
  height: 24px;
  font-size: 12px;
  color: ${isActive ? NeutralColors.white : '#545454'};
  background: ${isActive ? '#0078d4' : 'transparent'};
  opacity: ${isBroken ? 0.5 : 1};
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

export const diagnosticLink = css`
  display: flex;
  align-items: center;
  span {
    margin: 2px 5px;
  }
`;

export const diagnosticLinkMessages = css`
  max-width: 200px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

export const overflowSet = (isBroken: boolean) => css`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  line-height: 24px;
  justify-content: space-between;
  display: flex;
  i {
    color: ${isBroken ? SharedColors.red20 : 'inherit'};
  }
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

const diagnosticIcon = {
  width: '20px',
  height: '20px',
  fontSize: '12px',
  lineHeight: '20px',
  textAlign: 'center' as 'center',
};

const diagnosticErrorIcon = {
  ...diagnosticIcon,
  color: '#A80000',
  background: '#FED9CC',
};

const diagnosticWarningIcon = {
  ...diagnosticIcon,
  color: '#8A8780',
  background: '#FFF4CE',
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
    style: { fontSize: FontSizes.size12 },
    iconProps: {
      iconName: item.icon,
      styles: { root: { fontSize: FontSizes.size12, display: item.icon ? 'inherit' : 'none' } },
    },
    onClick: () => {
      item.onClick?.(link);
    },
  };
};

const onRenderItem = (textWidth: number) => (item: IOverflowSetItemProps) => {
  const { diagnostics = [] } = item;
  const warnings: Diagnostic[] = diagnostics.filter((diag) => diag.severity === DiagnosticSeverity.Warning);
  const errors: Diagnostic[] = diagnostics.filter((diag) => diag.severity === DiagnosticSeverity.Error);

  const warningContent = warnings.map((diag) => diag.message).join(',');

  const errorContent = errors.map((diag) => diag.message).join(',');

  const warningHTML = warnings.map((item) => {
    let linkText = item.source;
    if (item.message === 'Missing skill manifest' && item.source === 'manifest.json') {
      linkText = 'Create skill mainfest';
    }
    return (
      <div key={item.message} css={diagnosticLink}>
        <Icon iconName={'Warning'} style={diagnosticWarningIcon} />
        <span css={diagnosticLinkMessages} title={item.message}>
          {item.message}
        </span>
        <Link>{linkText}</Link>
      </div>
    );
  });

  const errorHTML = errors.map((item) => {
    let linkText = item.source;
    if (item.source === 'appsettings.json') {
      linkText = 'Fix in bot settings';
    }
    return (
      <div key={item.message} css={diagnosticLink}>
        <Icon iconName={'ErrorBadge'} style={diagnosticErrorIcon} />
        <span css={diagnosticLinkMessages} title={item.message}>
          {item.message}
        </span>
        <Link>{linkText}</Link>
      </div>
    );
  });

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
        {warnings.length ? (
          <TooltipHost content={warningHTML} directionalHint={DirectionalHint.bottomLeftEdge}>
            <Icon iconName={'WarningSolid'} style={warningIcon} />
          </TooltipHost>
        ) : undefined}
        {errors.length ? (
          <TooltipHost content={errorHTML} directionalHint={DirectionalHint.bottomLeftEdge}>
            <Icon iconName={'StatusErrorFull'} style={errorIcon} />
          </TooltipHost>
        ) : undefined}
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
  const isBroken = !!link.bot?.error;
  const spacerWidth = hasChildren ? 0 : SUMMARY_ARROW_SPACE + extraSpace;

  return (
    <div
      aria-label={a11yLabel}
      css={navItem(isActive, isBroken)}
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
        css={overflowSet(isBroken)}
        data-testid={linkString}
        items={[
          {
            key: linkString,
            icon: isBroken ? 'RemoveLink' : icon,
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
