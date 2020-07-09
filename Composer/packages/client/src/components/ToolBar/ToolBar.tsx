// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useCallback, Fragment, useMemo } from 'react';
import formatMessage from 'format-message';
import { ActionButton, CommandButton } from 'office-ui-fabric-react/lib/Button';
import { DialogInfo } from '@bfc/shared';
import get from 'lodash/get';

import { VisualEditorAPI } from '../../pages/design/FrameAPI';
import { useStoreContext } from '../../hooks/useStoreContext';

import { IToolBarItem } from './ToolBar.types';
import { actionButton, leftActions, rightActions, headerSub } from './ToolBarStyles';

type ToolbarProps = {
  toolbarItems?: Array<IToolBarItem>;
  currentDialog?: DialogInfo;
  onCreateDialogComplete?: (...args: any[]) => void;
  openNewTriggerModal?: () => void;
  showSkillManifestModal?: () => void;
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
  const {
    toolbarItems = [],
    currentDialog,
    onCreateDialogComplete,
    openNewTriggerModal,
    showSkillManifestModal,
    ...rest
  } = props;
  const {
    actions: { onboardingAddCoachMarkRef, createDialogBegin, exportToZip },
    state: { projectId, visualEditorSelection },
  } = useStoreContext();

  const { actionSelected, showDisableBtn, showEnableBtn } = useMemo(() => {
    const actionSelected = Array.isArray(visualEditorSelection) && visualEditorSelection.length > 0;
    if (!actionSelected) {
      return {};
    }
    const selectedActions = visualEditorSelection.map((id) => get(currentDialog?.content, id));
    const showDisableBtn = selectedActions.some((x) => get(x, 'disabled') !== true);
    const showEnableBtn = selectedActions.some((x) => get(x, 'disabled') === true);
    return { actionSelected, showDisableBtn, showEnableBtn };
  }, [visualEditorSelection]);

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

  const addNewRef = useCallback((addNew) => {
    onboardingAddCoachMarkRef({ addNew });
  }, []);

  return (
    <div aria-label={formatMessage('toolbar')} css={headerSub} role="region" {...rest}>
      <div css={leftActions}>
        {window.location.href.includes('/dialogs/') && (
          <div ref={addNewRef}>
            <CommandButton
              css={actionButton}
              data-testid="AddFlyout"
              iconProps={{ iconName: 'Add' }}
              menuProps={{
                items: [
                  {
                    'data-testid': 'FlyoutNewDialog',
                    key: 'adddialog',
                    text: formatMessage('Add new dialog'),
                    onClick: () => {
                      createDialogBegin([], onCreateDialogComplete);
                    },
                  },
                  {
                    'data-testid': 'FlyoutNewTrigger',
                    key: 'addtrigger',
                    text: formatMessage(`Add new trigger on {displayName}`, {
                      displayName: currentDialog?.displayName ?? '',
                    }),
                    onClick: () => {
                      openNewTriggerModal?.();
                    },
                  },
                ],
              }}
              text={formatMessage('Add')}
            />
          </div>
        )}
        {left.map(itemList)}{' '}
        {window.location.href.includes('/dialogs/') && (
          <CommandButton
            css={actionButton}
            disabled={!actionSelected}
            iconProps={{ iconName: 'RemoveOccurrence' }}
            menuProps={{
              items: [
                {
                  key: 'disable',
                  text: formatMessage('Disable'),
                  disabled: !showDisableBtn,
                  onClick: () => {
                    VisualEditorAPI.disableSelection();
                  },
                },
                {
                  key: 'enable',
                  text: formatMessage('Enable'),
                  disabled: !showEnableBtn,
                  onClick: () => {
                    VisualEditorAPI.enableSelection();
                  },
                },
              ],
            }}
            text={formatMessage('Disable')}
          />
        )}
        {window.location.href.includes('/dialogs/') && (
          <CommandButton
            css={actionButton}
            iconProps={{ iconName: 'OpenInNewWindow' }}
            menuProps={{
              items: [
                {
                  key: 'zipexport',
                  text: formatMessage('Export assets to .zip'),
                  onClick: () => {
                    exportToZip({ projectId });
                  },
                },
                {
                  key: 'exportAsSkill',
                  text: formatMessage('Export as skill'),
                  onClick: () => {
                    showSkillManifestModal?.();
                  },
                },
              ],
            }}
            text={formatMessage('Export')}
          />
        )}
      </div>
      <div css={rightActions}>{right.map(itemList)}</div>
    </div>
  );
}
