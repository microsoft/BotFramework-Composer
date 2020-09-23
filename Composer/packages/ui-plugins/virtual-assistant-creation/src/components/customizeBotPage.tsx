// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import formatMessage from 'format-message';
import React, { useContext } from 'react';
import { RouteComponentProps } from '@reach/router';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';

import { Dropdown, IDropdownStyles, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { AppContext } from './VirtualAssistantCreationModal';
import { DialogFooterWrapper } from './dialogFooterWrapper';
import { RouterPaths } from '../shared/constants';
import { AvailablePersonalities } from '../models/creationOptions';

// -------------------- Styles -------------------- //
const textFieldStyling = css`
  width: 400px !important;
`;

const horizontalStackTokens = { childrenGap: 10 };
const verticalStackTokens = { childrenGap: 15 };

const dropdownStyles: Partial<IDropdownStyles> = {
  dropdown: { width: 300 },
};

// -------------------- CustomizeBotPage -------------------- //
type CustomizeBotPageProps = {
  onDismiss: () => void;
} & RouteComponentProps<{}>;

export const CustomizeBotPage: React.FC<CustomizeBotPageProps> = (props) => {
  const { state, setState } = useContext(AppContext);
  const onDismiss = props.onDismiss;

  const personalityOptions = (): IDropdownOption[] => {
    return Object.values(AvailablePersonalities).map((personality) => {
      return { key: personality, text: formatMessage(personality) };
    });
  };

  return (
    <DialogWrapper
      isOpen={true}
      onDismiss={props.onDismiss}
      title={formatMessage('Customize your assistant')}
      subText={formatMessage(
        'Give your bot personality, multi-language capabilities and more. You can edit this later in Bot Settings.'
      )}
      dialogType={DialogTypes.CreateFlow}
    >
      <Stack tokens={verticalStackTokens}>
        <Stack.Item>
          <Label>{formatMessage('Bot Name')}</Label>
          <TextField
            onChange={(event: any, newValue?: string) => {
              setState({ ...state, selectedBotName: newValue as string });
            }}
            value={formatMessage(state.selectedBotName)}
            css={textFieldStyling}
          />
        </Stack.Item>
        <Stack.Item>
          <Label>{formatMessage('User Input')}</Label>
          <Stack horizontal={true} tokens={horizontalStackTokens}>
            <Checkbox
              label={formatMessage('Text')}
              onChange={() => {
                setState({ ...state, isTextEnabled: !state.isTextEnabled });
              }}
              checked={state.isTextEnabled}
            />
            <Checkbox
              label={formatMessage('Speech')}
              onChange={() => {
                setState({ ...state, isSpeechEnabled: !state.isSpeechEnabled });
              }}
              checked={state.isSpeechEnabled}
            />
          </Stack>
        </Stack.Item>
        <Stack.Item>
          <Dropdown
            placeholder={formatMessage('Select an option')}
            label={formatMessage('Personality')}
            options={personalityOptions()}
            styles={dropdownStyles}
            selectedKey={state.selectedPersonality}
            onChange={(ev: any, option?: IDropdownOption) => {
              setState({ ...state, selectedPersonality: AvailablePersonalities[option?.text as string] });
              console.log(state.selectedPersonality);
            }}
          />
        </Stack.Item>
        <Stack.Item>
          <Label>{formatMessage('Greeting Message')}</Label>
          <TextField
            css={textFieldStyling}
            value={formatMessage(state.selectedGreetingMessage)}
            onChange={(ev?: any, newValue?: string) => {
              setState({ ...state, selectedGreetingMessage: newValue as string });
            }}
          />
        </Stack.Item>
        <Stack.Item>
          <Label>{formatMessage('What will your Virtual Assistant say if it does not understand the user?')}</Label>
          <TextField
            css={textFieldStyling}
            value={formatMessage(state.selectedFallbackText)}
            onChange={(ev?: any, newValue?: string) => {
              setState({ ...state, selectedFallbackText: newValue as string });
            }}
          />
        </Stack.Item>
        <DialogFooterWrapper
          prevPath={RouterPaths.newBotPage}
          nextPath={RouterPaths.configSummaryPage}
          onDismiss={onDismiss}
        />
      </Stack>
    </DialogWrapper>
  );
};
