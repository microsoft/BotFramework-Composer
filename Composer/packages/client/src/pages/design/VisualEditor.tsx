// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useContext, useCallback, useState, useEffect } from 'react';
import formatMessage from 'format-message';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import get from 'lodash/get';

import grayComposerIcon from '../../images/grayComposerIcon.svg';
import { StoreContext } from '../../store';

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
  rootPath: string;
}

const VisualEditor: React.FC<VisualEditorProps> = props => {
  const { rootPath, openNewTriggerModal } = props;
  const [triggerButtonVisible, setTriggerButtonVisibility] = useState(false);
  const { state, actions } = useContext(StoreContext);
  const { designPageLocation, dialogs } = state;
  const { onboardingAddCoachMarkRef } = actions;
  const { selected, dialogId } = designPageLocation;

  const addRef = useCallback(visualEditor => onboardingAddCoachMarkRef({ visualEditor }), []);

  useEffect(() => {
    const dialog = dialogs.find(d => d.id === dialogId);
    const visible = get(dialog, 'triggers', []).length === 0;
    setTriggerButtonVisibility(visible);
  }, [dialogs, dialogId]);

  return (
    <React.Fragment>
      <iframe
        id="VisualEditor"
        key="VisualEditor"
        name="VisualEditor"
        css={visualEditor}
        hidden={triggerButtonVisible || !selected}
        src={`${rootPath}/extensionContainer.html`}
        ref={addRef}
      />
      {!selected && onRenderBlankVisual(triggerButtonVisible, openNewTriggerModal)}
    </React.Fragment>
  );
};

export { VisualEditor };
