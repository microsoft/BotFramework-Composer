// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useCallback } from 'react';
import { FontSizes } from '@uifabric/fluent-theme';
import { OverflowSet, IOverflowSetItemProps } from 'office-ui-fabric-react/lib/OverflowSet';
import { TooltipHost, DirectionalHint } from 'office-ui-fabric-react/lib/Tooltip';
import { ContextualMenuItemType, IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import formatMessage from 'format-message';
import { Callout } from 'office-ui-fabric-react/lib/Callout';
import { DiagnosticSeverity, Diagnostic } from '@bfc/shared';
import isEmpty from 'lodash/isEmpty';
import uniqueId from 'lodash/uniqueId';

import { SUMMARY_ARROW_SPACE, THREE_DOTS_ICON_WIDTH } from './constants';
import { TreeLink, TreeMenuItem } from './types';
import {
  calloutRootStyle,
  diagnosticLink,
  diagnosticWarningIcon,
  diagnosticErrorIcon,
  warningIcon,
  errorIcon,
  projectTreeItem,
  projectTreeItemContainer,
  itemName,
  moreButton,
  moreButtonContainer,
  treeItem,
  menuStyle,
  overflowSet,
} from './styles';

// -------------------- TreeItem -------------------- //

type ITreeItemProps = {
  link: TreeLink;
  isActive?: boolean;
  isChildSelected?: boolean;
  isSubItemActive?: boolean;
  onSelect?: (link: TreeLink) => void;
  icon?: string;
  dialogName?: string;
  textWidth?: number;
  extraSpace?: number;
  padLeft?: number;
  marginLeft?: number;
  hasChildren?: boolean;
  menu?: TreeMenuItem[];
  menuOpenCallback?: (cb: boolean) => void;
  isMenuOpen?: boolean;
  showErrors?: boolean;
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
  icon,
  dialogName,
  onSelect,
  textWidth = 100,
  hasChildren = false,
  menu = [],
  extraSpace = 0,
  padLeft = 0,
  marginLeft = 0,
  menuOpenCallback = () => {},
  isMenuOpen = false,
  showErrors = true,
}) => {
  const [thisItemSelected, setThisItemSelected] = useState<boolean>(false);
  const a11yLabel = `${dialogName ?? '$Root'}_${link.displayName}`;

  const overflowMenu = menu.map(renderTreeMenuItem(link));

  const linkString = `${link.projectId}_DialogTreeItem${link.dialogId}_${link.trigger ?? ''}`;
  const isBroken = !!link.botError;
  const spacerWidth = hasChildren && !isBroken ? 0 : SUMMARY_ARROW_SPACE + extraSpace;

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
            <span className={'treeItem-text'} css={itemName(maxTextWidth - (item.icon == null ? 0 : 12))}>
              {item.displayName}
            </span>
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
    },
    [textWidth, spacerWidth, extraSpace, overflowIconWidthActiveOrChildSelected, showErrors]
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
          <TooltipHost content={moreLabel} directionalHint={DirectionalHint.rightCenter} styles={moreButtonContainer}>
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
              role="cell"
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
    <span
      aria-label={a11yLabel}
      css={treeItem(isMenuOpen, isActive, thisItemSelected, isBroken, padLeft, marginLeft)}
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
      <span style={{ minWidth: `${spacerWidth}px` }}></span>
      <OverflowSet
        //In 8.0 the OverflowSet will no longer be wrapped in a FocusZone
        //remove this at that time
        doNotContainWithinFocusZone
        css={overflowSet(isBroken, textWidth)}
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
        onRenderItem={onRenderItem(textWidth, showErrors)}
        onRenderOverflowButton={onRenderOverflowButton(
          !!isActive,
          isChildSelected,
          menuOpenCallback,
          setThisItemSelected
        )}
      />
    </span>
  );
};
