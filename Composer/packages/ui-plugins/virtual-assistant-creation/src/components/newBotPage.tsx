// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import React, { useContext } from 'react';
import { RouteComponentProps } from '@reach/router';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { Label } from 'office-ui-fabric-react/lib/Label';

import { IAssistant } from '../models/stateModels';
import { RouterPaths } from '../shared/constants';

import { AppContext } from './VirtualAssistantCreationModal';
import { DialogFooterWrapper } from './dialogFooterWrapper';

// -------------------- NewBotPage -------------------- //
type NewBotPageProps = {
  onDismiss: () => void;
} & RouteComponentProps<{}>;

export const NewBotPage: React.FC<NewBotPageProps> = (props) => {
  const { state, setState } = useContext(AppContext);
  const onDismiss = props.onDismiss;

  const assistantSelectionChanged = (event: any, option?: IChoiceGroupOption) => {
    const selectedAssistant = state.availableAssistantTemplates.find((assistant: IAssistant) => {
      return assistant.name.toLowerCase() == option?.key.toLowerCase();
    });
    if (selectedAssistant) {
      setState({ ...state, selectedAssistant: selectedAssistant });
    }
  };

  const getAssistantsToRender = (): IChoiceGroupOption[] => {
    const result: IChoiceGroupOption[] = [];
    state.availableAssistantTemplates.forEach((assistant: IAssistant) => {
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
        styles={{
          root: {
            width: '100%',
          },
        }}
        onChange={(event: any, option?: IChoiceGroupOption) => {
          assistantSelectionChanged(event, option);
        }}
      />
      <DialogFooterWrapper
        nextPath={RouterPaths.customizeBotPage}
        prevPath={RouterPaths.defineConversationPage}
        onDismiss={onDismiss}
      />
    </DialogWrapper>
  );
};
