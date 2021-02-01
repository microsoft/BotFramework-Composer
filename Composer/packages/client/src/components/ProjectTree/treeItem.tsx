// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useState } from 'react';
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
import { ICalloutContentStyles, Callout } from 'office-ui-fabric-react/lib/Callout';
import { DiagnosticSeverity, Diagnostic } from '@bfc/shared';
import isEmpty from 'lodash/isEmpty';
import uniqueId from 'lodash/uniqueId';

import { TreeLink, TreeMenuItem } from './ProjectTree';
import { SUMMARY_ARROW_SPACE } from './constants';

// -------------------- Styles -------------------- //

const projectTreeItemContainer = css`
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

  label: ProjectTreeItemContainer;
`;

const projectTreeItem = css`
  outline: none;
  display: flex;
  align-items: center;
  height: 24px;
  padding-left: 4px;

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

const navItem = (
  isActive: boolean,
  isBroken: boolean,
  padLeft: number,
  isAnyMenuOpen: boolean,
  menuOpenHere: boolean
) => css`
  label: navItem;
  position: relative;
  height: 24px;
  font-size: 12px;
  padding-left: ${padLeft}px;
  color: ${isActive ? NeutralColors.white : '#545454'};
  background: ${isActive ? '#0078d4' : menuOpenHere ? '#f2f2f2' : 'transparent'};
  opacity: ${isBroken ? 0.5 : 1};
  font-weight: ${isActive ? FontWeights.semibold : FontWeights.regular};

  display: flex;
  flex-direction: row;
  align-items: center;

  ${isAnyMenuOpen
    ? ''
    : `&:hover {
    color: #545454;
    background: #f2f2f2;

    .dialog-more-btn {
      visibility: visible;
    }
  }`}

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
  align-content: start;
  p {
    margin: 2px 5px;
    max-width: 300px;
  }
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
`;

const moreButtonContainer = {
  root: {
    lineHeight: '1',
  },
};

const statusIcon = {
  fontSize: 15,
  paddingLeft: 8,
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

const calloutRootStyle = css`
  padding: 11px;
`;
// -------------------- TreeItem -------------------- //

interface ITreeItemProps {
  link: TreeLink;
  isActive?: boolean;
  isSubItemActive?: boolean;
  onSelect?: (link: TreeLink) => void;
  icon?: string;
  dialogName?: string;
  textWidth?: number;
  extraSpace?: number;
  padLeft?: number;
  hasChildren?: boolean;
  menu?: TreeMenuItem[];
  menuOpenCallback?: (cb: boolean) => void;
  isMenuOpen?: boolean;
  showErrors?: boolean;
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

const DiagnosticIcons = (props: {
  projectId: string;
  skillId: string;
  diagnostics: Diagnostic[];
  onErrorClick?: (projectId: string, skillId: string, diagnostic: Diagnostic) => void;
}) => {
  const [isErrorVisible, setIsErrorVisible] = useState(false);
  const [isWarningVisible, setIsWarningVisible] = useState(false);
  const { projectId, skillId, diagnostics, onErrorClick = () => {} } = props;
  const warnings: Diagnostic[] = diagnostics.filter((diag) => diag.severity === DiagnosticSeverity.Warning);
  const errors: Diagnostic[] = diagnostics.filter((diag) => diag.severity === DiagnosticSeverity.Error);
  const warningsId = uniqueId('diagnosticWarningIcon');
  const errorsId = uniqueId('diagnosticErrorIcon');
  const toggleIsErrorVisible = () => {
    setIsErrorVisible(!isErrorVisible);
  };

  const toggleIsWarningVisible = () => {
    setIsWarningVisible(!isWarningVisible);
  };

  const WarningCallout = () => (
    <Callout
      directionalHint={DirectionalHint.bottomLeftEdge}
      target={`#${warningsId}`}
      onDismiss={toggleIsWarningVisible}
    >
      <div css={calloutRootStyle}>
        {warnings.map((item) => {
          let linkText = item.source;
          if (item.message === 'Missing skill manifest' && item.source === 'manifest.json') {
            linkText = 'Create skill mainfest';
          }
          return (
            <div key={item.message} css={diagnosticLink}>
              <Icon iconName={'Warning'} style={diagnosticWarningIcon} />
              <p title={item.message}>
                {item.message}
                <Link
                  styles={{ root: { marginLeft: '5px' } }}
                  onClick={() => {
                    toggleIsWarningVisible();
                    onErrorClick(projectId, skillId, item);
                  }}
                >
                  {linkText}
                </Link>
              </p>
            </div>
          );
        })}
      </div>
    </Callout>
  );

  const ErrorCallout = () => (
    <Callout directionalHint={DirectionalHint.bottomLeftEdge} target={`#${errorsId}`} onDismiss={toggleIsErrorVisible}>
      <div css={calloutRootStyle}>
        {errors.map((item) => {
          let linkText = item.source;
          if (item.source === 'appsettings.json') {
            linkText = 'Fix in bot settings';
          }
          return (
            <div key={item.message} css={diagnosticLink}>
              <Icon iconName={'ErrorBadge'} style={diagnosticErrorIcon} />
              <p title={item.message}>
                {item.message}
                <Link
                  styles={{ root: { marginLeft: '5px' } }}
                  onClick={() => {
                    toggleIsErrorVisible();
                    onErrorClick(projectId, skillId, item);
                  }}
                >
                  {linkText}
                </Link>
              </p>
            </div>
          );
        })}
      </div>
    </Callout>
  );

  return (
    <React.Fragment>
      {!isEmpty(warnings) && (
        <Icon iconName={'WarningSolid'} id={warningsId} style={warningIcon} onClick={toggleIsWarningVisible} />
      )}
      {!isEmpty(errors) && (
        <Icon iconName={'StatusErrorFull'} id={errorsId} style={errorIcon} onClick={toggleIsErrorVisible} />
      )}
      {isErrorVisible && <ErrorCallout />}
      {isWarningVisible && <WarningCallout />}
    </React.Fragment>
  );
};

const onRenderItem = (textWidth: number, showErrors: boolean) => (item: IOverflowSetItemProps) => {
  const { diagnostics = [], projectId, skillId, onErrorClick } = item;

  let warningContent = '';
  let errorContent = '';

  if (showErrors) {
    const warnings: Diagnostic[] = diagnostics.filter(
      (diag: Diagnostic) => diag.severity === DiagnosticSeverity.Warning
    );
    const errors: Diagnostic[] = diagnostics.filter((diag: Diagnostic) => diag.severity === DiagnosticSeverity.Error);

    warningContent = warnings.map((diag) => diag.message).join(',');

    errorContent = errors.map((diag) => diag.message).join(',');
  }

  return (
    <div
      data-is-focusable
      aria-label={`${item.displayName} ${warningContent} ${errorContent}`}
      css={projectTreeItemContainer}
      role="cell"
      tabIndex={0}
      onBlur={item.onBlur}
      onFocus={item.onFocus}
    >
      <div css={projectTreeItem} role="presentation" tabIndex={-1}>
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
        {showErrors && (
          <DiagnosticIcons
            diagnostics={diagnostics}
            projectId={projectId}
            skillId={skillId}
            onErrorClick={onErrorClick}
          />
        )}
      </div>
    </div>
  );
};

const onRenderOverflowButton = (
  isActive: boolean,
  menuOpenCallback: (cb: boolean) => void,
  setThisItemSelected: (sel: boolean) => void
) => {
  const moreLabel = formatMessage('Actions');
  return (overflowItems: IContextualMenuItem[] | undefined) => {
    if (overflowItems == null) return null;
    return (
      <TooltipHost content={moreLabel} directionalHint={DirectionalHint.rightCenter} styles={moreButtonContainer}>
        <IconButton
          ariaLabel={moreLabel}
          className="dialog-more-btn"
          data-is-focusable={isActive}
          data-testid="dialogMoreButton"
          menuIconProps={{ iconName: 'MoreVertical' }}
          menuProps={{
            items: overflowItems,
            styles: menuStyle,
            onMenuOpened: () => {
              setThisItemSelected(true);
              menuOpenCallback(true);
            },
            onMenuDismissed: () => {
              setThisItemSelected(false);
              menuOpenCallback(false);
            },
          }}
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
  padLeft = 0,
  menuOpenCallback = () => {},
  isMenuOpen = false,
  showErrors = true,
}) => {
  const [thisItemSelected, setThisItemSelected] = useState<boolean>(false);

  const a11yLabel = `${dialogName ?? '$Root'}_${link.displayName}`;

  const overflowMenu = menu.map(renderTreeMenuItem(link));

  const linkString = `${link.projectId}_DialogTreeItem${link.dialogId}_${link.trigger ?? ''}`;
  const isBroken = !!link.botError;
  const spacerWidth = hasChildren ? 0 : SUMMARY_ARROW_SPACE + extraSpace;

  return (
    <div
      aria-label={a11yLabel}
      css={navItem(isActive, isBroken, padLeft, isMenuOpen, thisItemSelected)}
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
        onRenderItem={onRenderItem(textWidth - spacerWidth + extraSpace, showErrors)}
        onRenderOverflowButton={onRenderOverflowButton(!!isActive, menuOpenCallback, setThisItemSelected)}
      />
    </div>
  );
};
