/* eslint-disable format-message/literal-pattern */
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

import { RouterPaths } from '../shared/constants';
import { AvailablePersonalities } from '../models/creationOptions';

import { AppContext } from './VirtualAssistantCreationModal';
import { DialogFooterWrapper } from './dialogFooterWrapper';

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
      isOpen
      dialogType={DialogTypes.CreateFlow}
      subText={formatMessage(
        'Give your bot personality, multi-language capabilities and more. You can edit this later in Bot Settings.'
      )}
      title={formatMessage('Customize your assistant')}
      onDismiss={props.onDismiss}
    >
      <Stack tokens={verticalStackTokens}>
        <Stack.Item>
          <Label>{formatMessage('Bot Name')}</Label>
          <TextField
            css={textFieldStyling}
            value={formatMessage(state.selectedBotName)}
            onChange={(event: any, newValue?: string) => {
              setState({ ...state, selectedBotName: newValue as string });
            }}
          />
        </Stack.Item>
        <Stack.Item>
          <Label>{formatMessage('User Input')}</Label>
          <Stack horizontal tokens={horizontalStackTokens}>
            <Checkbox
              checked={state.isTextEnabled}
              label={formatMessage('Text')}
              onChange={() => {
                setState({ ...state, isTextEnabled: !state.isTextEnabled });
              }}
            />
            <Checkbox
              checked={state.isSpeechEnabled}
              label={formatMessage('Speech')}
              onChange={() => {
                setState({ ...state, isSpeechEnabled: !state.isSpeechEnabled });
              }}
            />
          </Stack>
        </Stack.Item>
        <Stack.Item>
          <Dropdown
            label={formatMessage('Personality')}
            options={personalityOptions()}
            placeholder={formatMessage('Select an option')}
            selectedKey={state.selectedPersonality}
            styles={dropdownStyles}
            onChange={(ev: any, option?: IDropdownOption) => {
              setState({ ...state, selectedPersonality: AvailablePersonalities[option?.text as string] });
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
          nextPath={RouterPaths.configSummaryPage}
          prevPath={RouterPaths.newBotPage}
          onDismiss={onDismiss}
        />
      </Stack>
    </DialogWrapper>
  );
};
