// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useCallback, Fragment } from 'react';
import formatMessage from 'format-message';
import { ActionButton, CommandButton } from 'office-ui-fabric-react/lib/Button';

import { headerSub, leftActions, rightActions, actionButton } from './styles';

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
export function ToolBar(props) {
  const {
    toolbarItems,
    actions,
    projectId,
    currentDialog,
    openNewTriggerModal,
    onCreateDialogComplete,
    onboardingAddCoachMarkRef,
    showSkillManifestModal,
    ...rest
  } = props;
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
  const addNewRef = useCallback(addNew => {
    onboardingAddCoachMarkRef({ addNew });
  }, []);

  return (
    <div css={headerSub} {...rest}>
      <div css={leftActions}>
        {window.location.href.indexOf('/dialogs/') !== -1 && (
          <div ref={addNewRef}>
            <CommandButton
              data-testid="AddFlyout"
              css={actionButton}
              iconProps={{ iconName: 'Add' }}
              text={formatMessage('Add')}
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
                      displayName: currentDialog ? currentDialog.displayName : '',
                    }),
                    onClick: () => openNewTriggerModal(),
                  },
                ],
              }}
            />
          </div>
        )}
        {left.map(itemList)}{' '}
        {window.location.href.indexOf('/dialogs/') !== -1 && (
          <CommandButton
            css={actionButton}
            iconProps={{ iconName: 'OpenInNewWindow' }}
            text={formatMessage('Export')}
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
          />
        )}
      </div>
      <div css={rightActions}>{right.map(itemList)}</div>
    </div>
  );
}
