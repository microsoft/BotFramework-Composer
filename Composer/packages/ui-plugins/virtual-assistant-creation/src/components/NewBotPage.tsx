// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import React, { useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { Label } from 'office-ui-fabric-react/lib/Label';

import { Assistant, SelectBotPageState } from '../models/stateModels';
import { RouterPaths } from '../constants';

import { DialogFooterWrapper } from './DialogFooterWrapper';

const choiceGroupStyling = {
  root: {
    width: '100%',
  },
};

// -------------------- NewBotPage -------------------- //
type NewBotPageProps = {
  onNext: (newSelectBotPageState: SelectBotPageState) => void;
  initialState: SelectBotPageState;
  onDismiss: () => void;
} & RouteComponentProps<{}>;

export const NewBotPage: React.FC<NewBotPageProps> = (props) => {
  const { onDismiss, initialState, onNext } = props;
  // copy global state to local state on render, local state used for internal tracking and global state refreshed when user proceeds to next modal
  const [state, setState] = useState(initialState);

  const assistantSelectionChanged = (event: any, option?: IChoiceGroupOption) => {
    const selectedAssistant = state.availableAssistantTemplates.find((assistant: Assistant) => {
      return assistant.name.toLowerCase() == option?.key.toLowerCase();
    });
    if (selectedAssistant) {
      setState({ ...state, selectedAssistant: selectedAssistant });
    }
  };

  const getAssistantsToRender = (): IChoiceGroupOption[] => {
    const result: IChoiceGroupOption[] = [];
    state.availableAssistantTemplates.forEach((assistant: Assistant) => {
      result.push({
        key: assistant.name,
        text: `${assistant.name} : ${assistant.description}`,
      });
    });
    return result;
  };

  return (
    <DialogWrapper
      isOpen
      dialogType={DialogTypes.CreateFlow}
      subText={formatMessage('Create a new bot or choose from Virtual assistant templates.')}
      title={formatMessage('Choose Your Assistant')}
      onDismiss={props.onDismiss}
    >
      <Label>{formatMessage('Choose one:')}</Label>
      <ChoiceGroup
        required
        defaultSelectedKey={state.selectedAssistant.name}
        options={getAssistantsToRender()}
        styles={choiceGroupStyling}
        onChange={(event: any, option?: IChoiceGroupOption) => {
          assistantSelectionChanged(event, option);
        }}
      />
      <DialogFooterWrapper
        nextPath={RouterPaths.customizeBotPage}
        prevPath={RouterPaths.defineConversationPage}
        updateState={() => {
          onNext(state);
        }}
        onDismiss={onDismiss}
      />
    </DialogWrapper>
  );
};
