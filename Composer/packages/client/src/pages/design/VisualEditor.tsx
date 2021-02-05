// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useCallback, useState, useEffect, useMemo } from 'react';
import formatMessage from 'format-message';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import get from 'lodash/get';
import VisualDesigner from '@bfc/adaptive-flow';
import { useRecoilValue } from 'recoil';
import { useFormConfig, useShellApi } from '@bfc/extension-client';
import clone from 'lodash/clone';

import grayComposerIcon from '../../images/grayComposerIcon.svg';
import { dispatcherState, dialogsSelectorFamily, schemasState, designPageLocationState } from '../../recoilModel';

import { middleTriggerContainer, middleTriggerElements, triggerButton, visualEditor } from './styles';

const addIconProps = {
  iconName: 'CircleAddition',
  styles: { root: { fontSize: '12px' } },
};

function onRenderBlankVisual(isTriggerEmpty, onClickAddTrigger, isRemoteSkill) {
  return (
    <div css={middleTriggerContainer}>
      <div css={middleTriggerElements}>
        {isRemoteSkill ? (
          <React.Fragment>
            <img alt={formatMessage('bot framework composer icon gray')} src={grayComposerIcon} />
            {formatMessage('Remote skill')}
          </React.Fragment>
        ) : isTriggerEmpty ? (
          <React.Fragment>
            {formatMessage(`This dialog has no trigger yet.`)}
            <ActionButton
              css={triggerButton}
              data-testid="MiddleAddNewTriggerButton"
              iconProps={addIconProps}
              onClick={onClickAddTrigger}
            >
              {formatMessage('New Trigger ..')}
            </ActionButton>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <img alt={formatMessage('bot framework composer icon gray')} src={grayComposerIcon} />
            {formatMessage('Select a trigger on the left')} <br /> {formatMessage('navigation to see actions')}
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

interface VisualEditorProps {
  openNewTriggerModal: () => void;
  onFocus?: (event: React.FocusEvent<HTMLDivElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLDivElement>) => void;
  isRemoteSkill?: boolean;
}

const VisualEditor: React.FC<VisualEditorProps> = (props) => {
  const { ...shellData } = useShellApi();
  const { projectId, currentDialog } = shellData;
  const { openNewTriggerModal, onFocus, onBlur, isRemoteSkill } = props;
  const [triggerButtonVisible, setTriggerButtonVisibility] = useState(false);
  const { onboardingAddCoachMarkRef } = useRecoilValue(dispatcherState);
  const dialogs = useRecoilValue(dialogsSelectorFamily(projectId));
  const schemas = useRecoilValue(schemasState(projectId));
  const designPageLocation = useRecoilValue(designPageLocationState(projectId));
  const { dialogId, selected } = designPageLocation;

  const addRef = useCallback((visualEditor) => onboardingAddCoachMarkRef({ visualEditor }), []);

  const formConfig = useFormConfig();
  const overridedSDKSchema = useMemo(() => {
    if (!dialogId) return {};
    const sdkSchema = schemas.sdk?.content ?? {};
    const sdkDefinitions = clone(sdkSchema.definitions) ?? {};
    // Override the sdk.schema 'title' field with form ui option 'label' field
    // to make sure the title is consistent with Form Editor.
    Object.entries(formConfig).forEach(([$kind, formOptions]) => {
      const sdkOptions = sdkDefinitions[$kind];
      if (formOptions && sdkOptions) {
        sdkDefinitions[$kind] = { ...sdkOptions, title: formOptions.label };
      }
    });
    return { ...sdkSchema, definitions: sdkDefinitions };
  }, [formConfig, schemas, dialogId]);
  useEffect(() => {
    const dialog = dialogs.find((d) => d.id === dialogId);
    const visible = dialog ? get(dialog, 'triggers', []).length === 0 : false;
    setTriggerButtonVisibility(visible);
  }, [dialogs, dialogId]);

  return (
    <React.Fragment>
      <div
        ref={addRef}
        aria-label={formatMessage('Visual editor')}
        css={visualEditor(triggerButtonVisible || !selected)}
        data-testid="VisualEditor"
      >
        {!isRemoteSkill ? (
          <VisualDesigner
            data={currentDialog.content ?? {}}
            schema={overridedSDKSchema}
            onBlur={onBlur}
            onFocus={onFocus}
          />
        ) : null}
      </div>
      {!selected && onRenderBlankVisual(triggerButtonVisible, openNewTriggerModal, isRemoteSkill)}
    </React.Fragment>
  );
};

export { VisualEditor };
