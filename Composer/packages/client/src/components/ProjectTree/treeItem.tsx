// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useState, useCallback } from 'react';
import { FontSizes, FluentTheme } from '@uifabric/fluent-theme';
import { DefaultPalette } from '@uifabric/styling';
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
import { DiagnosticSeverity, Diagnostic, Icons } from '@bfc/shared';
import isEmpty from 'lodash/isEmpty';
import uniqueId from 'lodash/uniqueId';

import { THREE_DOTS_ICON_WIDTH } from './constants';
import { TreeLink, TreeMenuItem } from './types';
import { TreeItemContent } from './TreeItemContent';

// -------------------- Styles -------------------- //

const projectTreeItemContainer = (extraSpace: number) => css`
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

  padding-left: ${extraSpace}px;

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
      alignSelf: 'stretch',
      visibility: isActive ? 'visible' : 'hidden',
      height: 24,
      width: 24,
      color: '#000',
    },
    menuIcon: {
      fontSize: '12px',
      color: NeutralColors.gray160,
    },
    rootHovered: {
      color: DefaultPalette.accent,
      selectors: {
        '.ms-Button-menuIcon': {
          fontWeight: 600,
        },
      },
    },
  };
};

const navContainer = (
  isAnyMenuOpen: boolean,
  isActive: boolean,
  menuOpenHere: boolean,
  textWidth: number,
  isBroken: boolean
) => css`
  ${isAnyMenuOpen
    ? ''
    : `
    &:hover {
      background: ${isActive ? NeutralColors.gray40 : NeutralColors.gray20};
        .dialog-more-btn {
          visibility: visible;
        }
        .action-btn {
          visibility: visible;
        }
        .treeItem-text {
          max-width: ${textWidth}px;
        }
        .external-link {
          visibility: visible;
        }
      }`};

  background: ${isActive ? NeutralColors.gray30 : menuOpenHere ? '#f2f2f2' : 'transparent'};

  display: inline-flex;
  flex-direction: row;

  label: navItem;

  font-size: 12px;
  min-width: 100%;
  opacity: ${isBroken ? 0.5 : 1};
  align-items: center;

  :hover {
    background: ${isActive ? NeutralColors.gray40 : NeutralColors.gray20};
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
  justify-content: space-between;
  display: inline-flex;
  i {
    color: ${isBroken ? SharedColors.red20 : 'inherit'};
  }
`;

const moreButtonContainer = {
  root: {
    lineHeight: '1',
    display: 'flex' as 'flex',
  },
};

const statusIcon = {
  fontSize: 15,
  paddingLeft: 8,
};

const warningIcon = {
  ...statusIcon,
  color: FluentTheme.palette.yellow,
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
export const itemName = (nameWidth: number) => css`
  max-width: ${nameWidth}px;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 1;
`;

const calloutRootStyle = css`
  padding: 11px;
`;

type TreeObject =
  | 'bot'
  | 'dialog'
  | 'topic'
  | 'system topic'
  | 'trigger' // basic ProjectTree elements
  | 'trigger group'
  | 'form dialog'
  | 'form field'
  | 'form trigger' // used with form dialogs
  | 'lg'
  | 'lu' // used on other pages
  | 'external skill'; // used with multi-bot authoring

const TreeIcons: { [key in TreeObject]: string | null } = {
  bot: Icons.BOT,
  dialog: Icons.DIALOG,
  trigger: Icons.TRIGGER,
  topic: Icons.TOPIC,
  'system topic': Icons.SYSTEM_TOPIC,
  'trigger group': null,
  'form dialog': Icons.FORM_DIALOG,
  'form field': Icons.FORM_FIELD, // x in parentheses
  'form trigger': Icons.FORM_TRIGGER, // lightning bolt with gear
  lg: Icons.LG,
  lu: Icons.LU,
  'external skill': Icons.EXTERNAL_SKILL,
};

const objectNames: { [key in TreeObject]: () => string } = {
  trigger: () => formatMessage('Trigger'),
  dialog: () => formatMessage('Dialog'),
  topic: () => formatMessage('User Topic'),
  'system topic': () => formatMessage('System Topic'),
  'trigger group': () => formatMessage('Trigger group'),
  'form dialog': () => formatMessage('Form dialog'),
  'form field': () => formatMessage('Form field'),
  'form trigger': () => formatMessage('Form trigger'),
  lg: () => formatMessage('LG'),
  lu: () => formatMessage('LU'),
  bot: () => formatMessage('Bot'),
  'external skill': () => formatMessage('External skill'),
};

// -------------------- TreeItem -------------------- //

type ITreeItemProps = {
  link: TreeLink;
  isActive?: boolean;
  isChildSelected?: boolean;
  isSubItemActive?: boolean;
  onSelect?: (link: TreeLink) => void;
  itemType: TreeObject;
  dialogName?: string;
  textWidth?: number;
  extraSpace?: number;
  marginLeft?: number;
  hasChildren?: boolean;
  menu?: TreeMenuItem[];
  menuOpenCallback?: (cb: boolean) => void;
  isMenuOpen?: boolean;
  showErrors?: boolean;
  role?: string;
  href?: string;
  tooltip?: string;
};

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

export const TreeItem: React.FC<ITreeItemProps> = ({
  link,
  isActive = false,
  isChildSelected = false,
  itemType,
  dialogName,
  onSelect,
  textWidth = 100,
  menu = [],
  menuOpenCallback = () => {},
  isMenuOpen = false,
  showErrors = true,
  role,
}) => {
  const [thisItemSelected, setThisItemSelected] = useState<boolean>(false);

  const ariaLabel = `${objectNames[itemType]()} ${link.displayName}`;
  const dataTestId = `${dialogName ?? '$Root'}_${link.displayName}`;
  const isExternal = Boolean(link.href);

  const overflowMenu = menu.map(renderTreeMenuItem(link));

  const linkString = `${link.projectId}_DialogTreeItem${link.dialogId}_${link.trigger ?? ''}`;
  const isBroken = !!link.botError;

  const overflowIconWidthOnHover = overflowMenu.length > 0 ? THREE_DOTS_ICON_WIDTH : 0;

  const overflowIconWidthActiveOrChildSelected =
    (isActive || isChildSelected) && overflowMenu.length > 0 ? THREE_DOTS_ICON_WIDTH : 0;

  const onRenderItem = useCallback(
    (maxTextWidth: number, showErrors: boolean) => (item: IOverflowSetItemProps) => {
      const { diagnostics = [], projectId, skillId, onErrorClick } = item;

      let warningContent = '';
      let errorContent = '';
      if (showErrors) {
        const warnings: Diagnostic[] = diagnostics.filter(
          (diag: Diagnostic) => diag.severity === DiagnosticSeverity.Warning
        );
        const errors: Diagnostic[] = diagnostics.filter(
          (diag: Diagnostic) => diag.severity === DiagnosticSeverity.Error
        );

        warningContent = warnings.map((diag) => diag.message).join(',');

        errorContent = errors.map((diag) => diag.message).join(',');
      }

      return (
        <TreeItemContent tooltip={link.tooltip}>
          <div
            data-is-focusable
            aria-label={`${ariaLabel} ${warningContent} ${errorContent}`}
            css={projectTreeItemContainer}
            tabIndex={0}
            onBlur={item.onBlur}
            onFocus={item.onFocus}
          >
            <div css={projectTreeItem} role="presentation" tabIndex={-1}>
              {item.itemType != null && TreeIcons[item.itemType] != null && (
                <Icon
                  iconName={TreeIcons[item.itemType]}
                  styles={{
                    root: {
                      width: '12px',
                      marginRight: '8px',
                      outline: 'none',
                      marginTop: '3px',
                    },
                  }}
                  tabIndex={-1}
                />
              )}
              <span className={'treeItem-text'} css={itemName(maxTextWidth)}>
                {item.displayName}
              </span>
              {isExternal && (
                <Icon
                  className="external-link"
                  iconName="NavigateExternalInline"
                  styles={{ root: { visibility: 'hidden', width: '12px', marginLeft: '4px', outline: 'none' } }}
                />
              )}
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
        </TreeItemContent>
      );
    },
    [textWidth, overflowIconWidthActiveOrChildSelected, showErrors]
  );

  const onRenderOverflowButton = useCallback(
    (
      isActive: boolean,
      isChildSelected: boolean,
      menuOpenCallback: (cb: boolean) => void,
      setThisItemSelected: (sel: boolean) => void
    ) => {
      const moreLabel = formatMessage('More options');
      return (overflowItems: IContextualMenuItem[] | undefined) => {
        if (overflowItems == null) return null;
        return (
          <TooltipHost
            content={moreLabel}
            directionalHint={DirectionalHint.rightCenter}
            styles={moreButtonContainer}
            tabIndex={0}
          >
            <IconButton
              ariaLabel={moreLabel}
              className="dialog-more-btn"
              data-is-focusable={isActive}
              data-testid="dialogMoreButton"
              menuIconProps={{
                iconName: 'More',
              }}
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
              styles={moreButton(isActive || isChildSelected)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.stopPropagation();
                }
              }}
            />
          </TooltipHost>
        );
      };
    },
    [isActive, isChildSelected, menuOpenCallback, setThisItemSelected]
  );

  return (
    <div
      aria-label={ariaLabel}
      css={navContainer(isMenuOpen, isActive, thisItemSelected, textWidth - overflowIconWidthOnHover, isBroken)}
      data-testid={dataTestId}
      role={role}
      tabIndex={0}
      onClick={
        onSelect
          ? () => {
              onSelect(link);
            }
          : undefined
      }
      onKeyDown={
        onSelect
          ? (e) => {
              if (e.key === 'Enter') {
                onSelect(link);
                e.stopPropagation();
              }
            }
          : undefined
      }
    >
      <OverflowSet
        //In 8.0 the OverflowSet will no longer be wrapped in a FocusZone
        //remove this at that time
        doNotContainWithinFocusZone
        css={overflowSet(isBroken)}
        data-testid={linkString}
        items={[
          {
            key: linkString,
            icon: isBroken ? 'RemoveLink' : TreeIcons[itemType],
            itemType,
            ...link,
          },
        ]}
        overflowItems={overflowMenu}
        styles={{ item: { flex: 1 } }}
        onRenderItem={onRenderItem(textWidth, showErrors)}
        onRenderOverflowButton={onRenderOverflowButton(
          !!isActive,
          isChildSelected,
          menuOpenCallback,
          setThisItemSelected
        )}
      />
    </div>
  );
};
