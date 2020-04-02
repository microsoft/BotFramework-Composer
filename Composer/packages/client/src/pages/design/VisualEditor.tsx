// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useContext, useCallback, useState, useEffect, useMemo } from 'react';
import formatMessage from 'format-message';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import get from 'lodash/get';
import VisualDesigner from '@bfc/visual-designer';
import Extension from '@bfc/extension';

import { isAbsHosted } from '../../utils/envUtil';
import grayComposerIcon from '../../images/grayComposerIcon.svg';
import { StoreContext } from '../../store';
import { useShellApi } from '../../useShellApi';
import { getDialogData } from '../../utils';

import { middleTriggerContainer, middleTriggerElements, triggerButton, visualEditor } from './styles';

const addIconProps = {
  iconName: 'CircleAddition',
  styles: { root: { fontSize: '12px' } },
};

function onRenderBlankVisual(isTriggerEmpty, onClickAddTrigger) {
  return (
    <div css={middleTriggerContainer}>
      <div css={middleTriggerElements}>
        {isTriggerEmpty ? (
          <React.Fragment>
            {formatMessage(`This dialog has no trigger yet.`)}
            <ActionButton
              data-testid="MiddleAddNewTriggerButton"
              iconProps={addIconProps}
              css={triggerButton}
              onClick={onClickAddTrigger}
            >
              {formatMessage('New Trigger ..')}
            </ActionButton>
          </React.Fragment>
        ) : (
          <div>
            <img alt={formatMessage('bot framework composer icon gray')} src={grayComposerIcon} />
            {formatMessage('Select a trigger on the left')} <br /> {formatMessage('navigation to see actions')}
          </div>
        )}
      </div>
    </div>
  );
}

interface VisualEditorProps {
  openNewTriggerModal: () => void;
}

const VisualEditor: React.FC<VisualEditorProps> = props => {
  const shellApi = useShellApi('VisualEditor');
  const { openNewTriggerModal } = props;
  const [triggerButtonVisible, setTriggerButtonVisibility] = useState(false);
  const { state, actions } = useContext(StoreContext);
  const { onboardingAddCoachMarkRef } = actions;
  const { locale, botName, projectId, dialogs, focusPath, schemas, lgFiles, luFiles, designPageLocation } = state;
  const { dialogId, selected, focused, promptTab } = designPageLocation;

  const dialogsMap = useMemo(() => {
    return dialogs.reduce((result, dialog) => {
      result[dialog.id] = dialog.content;
      return result;
    }, {});
  }, [dialogs]);

  const currentDialog = dialogs.find(d => d.id === dialogId);
  const data = getDialogData(dialogsMap, dialogId);

  // @ts-ignore
  const shellData: ShellData = currentDialog
    ? {
        data,
        locale,
        botName,
        projectId,
        dialogs,
        dialogId,
        focusPath,
        schemas,
        lgFiles,
        luFiles,
        currentDialog,
        designerId: get(data, '$designer.id'),
        focusedEvent: selected,
        focusedActions: focused ? [focused] : [],
        focusedSteps: focused ? [focused] : selected ? [selected] : [],
        focusedTab: promptTab,
        clipboardActions: state.clipboardActions,
        hosted: isAbsHosted(),
      }
    : {};

  const addRef = useCallback(visualEditor => onboardingAddCoachMarkRef({ visualEditor }), []);

  useEffect(() => {
    const dialog = dialogs.find(d => d.id === dialogId);
    const visible = get(dialog, 'triggers', []).length === 0;
    setTriggerButtonVisibility(visible);
  }, [dialogs, dialogId]);

  return (
    <React.Fragment>
      <div
        css={visualEditor(triggerButtonVisible || !selected)}
        aria-label={formatMessage('visual editor')}
        ref={addRef}
      >
        <Extension shell={shellApi as any} shellData={shellData}>
          <VisualDesigner
            {...shellData}
            onChange={shellApi.saveData}
            shellApi={shellApi as any}
            schema={schemas.sdk?.content}
          />
        </Extension>
      </div>
      {!selected && onRenderBlankVisual(triggerButtonVisible, openNewTriggerModal)}
    </React.Fragment>
  );
};

export { VisualEditor };
