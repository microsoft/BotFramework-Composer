// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useCallback, Fragment, useContext } from 'react';
import formatMessage from 'format-message';
import { ActionButton, CommandButton } from 'office-ui-fabric-react/lib/Button';
import { DialogInfo } from '@bfc/shared';

import { StoreContext } from '../../store';

import { headerSub, leftActions, rightActions, actionButton } from './styles';

export type IToolBarItem = {
  align: string;
  type: string;
  text?: string;
  element?: any;
  buttonProps?: {
    iconProps?: {
      iconName: string;
    };
    onClick: () => void;
  };
  disabled?: boolean;
};

export type IToolBarProps = {
  toolbarItems?: IToolBarItem[];
  currentDialog?: DialogInfo;
  projectId?: string;
  openNewTriggerModal?: () => void;
  onCreateDialogComplete?: (newDialog: string) => void;
  showSkillManifestModal?: () => void;
};

function itemList(action, index) {
  if (action.type === 'element') {
    return <Fragment key={index}>{action.element}</Fragment>;
  } else {
    return (
      <ActionButton
        key={index}
        css={actionButton}
        {...action.buttonProps}
        data-testid={action.dataTestid}
        disabled={action.disabled}
      >
        {action.text}
      </ActionButton>
    );
  }
}

// support ActionButton or React Elements, the display order is array index.
// action = {type:action/element, text, align, element, buttonProps: use
// fabric-ui IButtonProps interface}
export function ToolBar(props: IToolBarProps) {
  const { actions } = useContext(StoreContext);
  const { onboardingAddCoachMarkRef } = actions;

  const {
    toolbarItems,
    projectId,
    currentDialog,
    openNewTriggerModal,
    onCreateDialogComplete,
    showSkillManifestModal,
    ...rest
  } = props;
  const left = toolbarItems?.filter((item) => item.align === 'left') ?? [];
  const right = toolbarItems?.filter((item) => item.align === 'right') ?? [];

  const addNewRef = useCallback((addNew) => {
    onboardingAddCoachMarkRef({ addNew });
  }, []);

  return (
    <div aria-label={formatMessage('toolbar')} css={headerSub} role="region" {...rest}>
      <div css={leftActions}>
        {window.location.href.indexOf('/dialogs/') !== -1 && (
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
                    onClick: () => actions.createDialogBegin([], onCreateDialogComplete),
                  },
                  {
                    'data-testid': 'FlyoutNewTrigger',
                    key: 'addtrigger',
                    text: formatMessage(`Add new trigger on {displayName}`, {
                      displayName: currentDialog?.displayName ?? '',
                    }),
                    onClick: () => openNewTriggerModal?.(),
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
            iconProps={{ iconName: 'OpenInNewWindow' }}
            menuProps={{
              items: [
                {
                  key: 'zipexport',
                  text: formatMessage('Export assets to .zip'),
                  onClick: () => actions.exportToZip({ projectId }),
                },
                {
                  key: 'exportAsSkill',
                  text: formatMessage('Export as skill'),
                  onClick: showSkillManifestModal,
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
