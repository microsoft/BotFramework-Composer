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

interface CustomizeBotPageProps
  extends RouteComponentProps<{
    location: string;
  }> {
  // Add Props Here
}

export const CustomizeBotPage: React.FC<CustomizeBotPageProps> = (props) => {
  const { state, setState } = useContext(AppContext);

  let textFieldId = 'botNameTextField';
  let textFieldClassName = mergeStyles({
    width: '400px !important',
  });
  let onLanguageChange = (editedLanguage: string, isAdded?: boolean) => {
    var resultArray = [...state.selectedLanguages];
    if (isAdded) {
      resultArray.push(editedLanguage);
    } else {
      var indexToRemove = resultArray.indexOf(editedLanguage);
      if (indexToRemove !== -1) {
        resultArray.splice(indexToRemove, 1);
      }
    }
    setState({ ...state, selectedLanguages: resultArray });
  };

  let onUserInputChange = (editedInput: string, isAdded?: boolean) => {
    var resultArray = [...state.selectedUserInput];
    if (isAdded) {
      resultArray.push(editedInput);
    } else {
      var indexToRemove = resultArray.indexOf(editedInput);
      if (indexToRemove !== -1) {
        resultArray.splice(indexToRemove, 1);
      }
    }
    setState({ ...state, selectedUserInput: resultArray });
  };

  const personalityOptions: IDropdownOption[] = [
    { key: 'professional', text: 'Professional' },
    { key: 'enthusiastic', text: 'Enthusiastic' },
    { key: 'friendly', text: 'Friendly' },
    { key: 'witty', text: 'Witty' },
    { key: 'caring', text: 'Caring' },
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
        <Label htmlFor={textFieldId}>Bot Name</Label>
        <TextField
          onChange={(event: any, newValue?: string) => {
            setState({ ...state, selectedBotName: newValue as string });
          }}
          className={textFieldClassName}
          id={textFieldId}
        />
        <Label>User Input</Label>
        <Stack horizontal={true} tokens={stackTokens}>
          <Checkbox
            label="Text"
            onChange={(ev: any, checked?: boolean) => {
              onUserInputChange('Text', checked);
            }}
          />
          <Checkbox
            label="Speech"
            onChange={(ev: any, checked?: boolean) => {
              onUserInputChange('Speech', checked);
            }}
          />
        </Stack>{' '}
        <br />
        <Stack tokens={stackTokens}>
          <Dropdown
            placeholder="Select an option"
            label="Personality"
            options={personalityOptions}
            styles={dropdownStyles}
            onChange={(ev: any, option?: IDropdownOption) => {
              setState({ ...state, selectedPersonality: option?.text as string });
            }}
          />
        </Stack>
        {/* <ChoiceGroup label="Choose Welcome Image" options={iconOptions} onChange={(ev?: any, option?: IChoiceGroupOption) => { setState({ ...state, selectedGreetingMessage: option?.text as string });}} /> */}
        <Label htmlFor={textFieldId}>What will your Virtual Assistant say if it does not understand the user?</Label>
        <TextField
          className={textFieldClassName}
          id={textFieldId}
          defaultValue="I am sorry, I didn't understand that"
          onChange={(ev?: any, newValue?: string) => {
            setState({ ...state, selectedFallbackText: newValue as string });
          }}
        />
        <Label htmlFor={textFieldId}>Greeting Message</Label>
        <TextField
          className={textFieldClassName}
          id={textFieldId}
          defaultValue="Hi! My name is basic bot. Here are some things that I can do!"
          onChange={(ev?: any, newValue?: string) => {
            setState({ ...state, selectedGreetingMessage: newValue as string });
          }}
        />
        <DialogFooter>
          <DefaultButton text={formatMessage('Cancel')} />
          <PrimaryButton
            data-testid="SubmitNewBotBtn"
            text={formatMessage('Next')}
            onClick={() => {
              navigate(`./preProvision`);
            }}
          />
        </DialogFooter>
      </DialogWrapper>
    </Fragment>
  );
};

export default CustomizeBotPage;
