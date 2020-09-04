// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Fragment, useContext } from 'react';
import { RouteComponentProps, navigate } from '@reach/router';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';
import { ChoiceGroup, IChoiceGroupOption, IChoiceGroupOptionStyleProps } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { Dropdown, IDropdownStyles, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { mergeStyles } from '@uifabric/merge-styles';
import { AppContext } from './VirtualAssistantCreationModal';
import { DialogFooterWrapper } from './dialogFooterWrapper';
import { RouterPaths } from '../shared/constants';
import { AvailablePersonalities } from '../models/creationOptions';

interface CustomizeBotPageProps
  extends RouteComponentProps<{
    location: string;
  }> {
  onDismiss: () => void;
}

export const CustomizeBotPage: React.FC<CustomizeBotPageProps> = (props) => {
  const { state, setState } = useContext(AppContext);

  let textFieldId = 'botNameTextField';
  let textFieldClassName = mergeStyles({
    width: '400px !important',
  });

  const personalityOptions: IDropdownOption[] = [
    { key: AvailablePersonalities.professional, text: AvailablePersonalities.professional },
    { key: AvailablePersonalities.enthusiastic, text: AvailablePersonalities.enthusiastic },
    { key: AvailablePersonalities.friendly, text: AvailablePersonalities.friendly },
    { key: AvailablePersonalities.witty, text: AvailablePersonalities.witty },
    { key: AvailablePersonalities.caring, text: AvailablePersonalities.caring },
  ];

  const iconOptions: IChoiceGroupOption[] = [
    { key: 'day', text: 'Retro Bot', iconProps: { iconName: 'Robot' } },
    { key: 'week', text: 'Happy Bot', iconProps: { iconName: 'ChatBot' } },
    { key: 'month', text: 'Silly Bot', iconProps: { iconName: 'Emoji2' } },
  ];

  const dropdownStyles: Partial<IDropdownStyles> = {
    dropdown: { width: 300 },
  };
  const stackTokens = { childrenGap: 10 };
  const verticalStackTokens = { childrenGap: 15 };

  return (
    <Fragment>
      <DialogWrapper
        isOpen={true}
        // onDismiss={null}
        title={'Customize your assistant'}
        subText={
          'Give your bot personality, multi-language capabilities and more. You can edit this later in Bot Settings.'
        }
        dialogType={DialogTypes.CreateFlow}
      >
        <Stack tokens={verticalStackTokens}>
          <Stack.Item>
            <Label htmlFor={textFieldId}>Bot Name</Label>
            <TextField
              onChange={(event: any, newValue?: string) => {
                setState({ ...state, selectedBotName: newValue as string });
              }}
              value={state.selectedBotName}
              className={textFieldClassName}
              id={textFieldId}
            />
          </Stack.Item>
          <Stack.Item>
            <Label>User Input</Label>
            <Stack horizontal={true} tokens={stackTokens}>
              <Checkbox
                label="Text"
                onChange={(ev: any, checked?: boolean) => {
                  setState({ ...state, isTextEnabled: !state.isTextEnabled });
                }}
                checked={state.isTextEnabled}
              />
              <Checkbox
                label="Speech"
                onChange={(ev: any, checked?: boolean) => {
                  setState({ ...state, isSpeechEnabled: !state.isSpeechEnabled });
                }}
                checked={state.isSpeechEnabled}
              />
            </Stack>{' '}
          </Stack.Item>
          <Stack.Item>
            {/* <Stack tokens={stackTokens}> */}
            <Dropdown
              placeholder="Select an option"
              label="Personality"
              options={personalityOptions}
              styles={dropdownStyles}
              selectedKey={state.selectedPersonality}
              onChange={(ev: any, option?: IDropdownOption) => {
                setState({ ...state, selectedPersonality: AvailablePersonalities[option?.text as string] });
                console.log(state.selectedPersonality);
              }}
            />
          </Stack.Item>
          <Stack.Item>
            <Label htmlFor={textFieldId}>Greeting Message</Label>
            <TextField
              className={textFieldClassName}
              id={textFieldId}
              value={state.selectedGreetingMessage}
              onChange={(ev?: any, newValue?: string) => {
                setState({ ...state, selectedGreetingMessage: newValue as string });
              }}
            />
          </Stack.Item>
          <Stack.Item>
            <Label htmlFor={textFieldId}>
              What will your Virtual Assistant say if it does not understand the user?
            </Label>
            <TextField
              className={textFieldClassName}
              id={textFieldId}
              value={state.selectedFallbackText}
              onChange={(ev?: any, newValue?: string) => {
                setState({ ...state, selectedFallbackText: newValue as string });
              }}
            />
          </Stack.Item>
          <DialogFooterWrapper
            prevPath={RouterPaths.newBotPage}
            nextPath={RouterPaths.configSummaryPage}
            onDismiss={props.onDismiss}
          />
        </Stack>
      </DialogWrapper>
    </Fragment>
  );
};

export default CustomizeBotPage;
