import { mergeStyles } from '@uifabric/merge-styles';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { Dropdown, IDropdownOption, IDropdownStyles } from 'office-ui-fabric-react/lib/Dropdown';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import React from 'react';
import { connect } from 'react-redux';
import { AnyAction, Dispatch } from 'redux';
import { IAppState } from '../../../models/reduxState';
import { actionTypes, genericSingleAction } from '../../shared/actions';
import { RouterPaths } from '../../shared/constants';
import { ModalShell } from './modalShell';

interface StateProps {
  selectedLanguages: string[];
  selectedUserInput: string[];
}

interface DispatchProps {
  updateRootStateVariable: (stateVariableName: string, value: any) => void;
}

interface Props {}

type PropsType = StateProps & DispatchProps & Props;

export class CustomizeBotPage extends React.Component<PropsType> {
  constructor(props: PropsType) {
    super(props);
  }

  private onLanguageChange = (editedLanguage: string, isAdded?: boolean) => {
    var resultArray = [...this.props.selectedLanguages];
    if (isAdded) {
      resultArray.push(editedLanguage);
    } else {
      var indexToRemove = resultArray.indexOf(editedLanguage);
      if (indexToRemove !== -1) {
        resultArray.splice(indexToRemove, 1);
      }
    }
    this.props.updateRootStateVariable('selectedLanguages', resultArray);
  };

  private onUserInputChange = (editedInput: string, isAdded?: boolean) => {
    var resultArray = [...this.props.selectedUserInput];
    if (isAdded) {
      resultArray.push(editedInput);
    } else {
      var indexToRemove = resultArray.indexOf(editedInput);
      if (indexToRemove !== -1) {
        resultArray.splice(indexToRemove, 1);
      }
    }
    this.props.updateRootStateVariable('selectedUserInput', resultArray);
  };

  render() {
    let textFieldId = 'botNameTextField';
    let textFieldClassName = mergeStyles({
      width: '400px !important',
    });

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
      <ModalShell
        title="Customize your assistant"
        subTitle="Give your bot personality, multi-language capabilities and more. You can edit this later in Bot Settings."
        nextPath={RouterPaths.addSkills}
        previousPath={RouterPaths.newBotModal}
      >
        <div>
          <Label htmlFor={textFieldId}>Bot Name</Label>
          <TextField
            onChange={(event: any, newValue?: string) => {
              this.props.updateRootStateVariable('selectedBotName', newValue);
            }}
            className={textFieldClassName}
            id={textFieldId}
          />
          <br />
          <Label>User Input</Label>
          <Stack horizontal={true} tokens={stackTokens}>
            <Checkbox
              label="Text"
              onChange={(ev: any, checked?: boolean) => {
                this.onUserInputChange('Text', checked);
              }}
            />
            <Checkbox
              label="Speech"
              onChange={(ev: any, checked?: boolean) => {
                this.onUserInputChange('Speech', checked);
              }}
            />
          </Stack>{' '}
          <br />
          <Label>Language</Label>
          <Stack horizontal={true} tokens={stackTokens}>
            <Checkbox
              label="English"
              onChange={(ev: any, checked?: boolean) => {
                this.onLanguageChange('English', checked);
              }}
            />
            <Checkbox
              label="Spanish"
              onChange={(ev: any, checked?: boolean) => {
                this.onLanguageChange('Spanish', checked);
              }}
            />
            <Checkbox
              label="French"
              onChange={(ev: any, checked?: boolean) => {
                this.onLanguageChange('French', checked);
              }}
            />
            <Checkbox
              label="Chinese"
              onChange={(ev: any, checked?: boolean) => {
                this.onLanguageChange('Chinese', checked);
              }}
            />
            <Checkbox
              label="Italian"
              onChange={(ev: any, checked?: boolean) => {
                this.onLanguageChange('Italian', checked);
              }}
            />
            <Checkbox
              label="German"
              onChange={(ev: any, checked?: boolean) => {
                this.onLanguageChange('German', checked);
              }}
            />
          </Stack>
          <Stack tokens={stackTokens}>
            <br />
            <Dropdown
              placeholder="Select an option"
              label="Personality"
              options={personalityOptions}
              styles={dropdownStyles}
              onChange={(ev: any, option?: IDropdownOption) => {
                this.props.updateRootStateVariable('selectedPersonality', option?.text);
              }}
            />
          </Stack>
          <br />
          <ChoiceGroup
            label="Choose Welcome Image"
            options={iconOptions}
            onChange={(ev?: any, option?: IChoiceGroupOption) => {
              this.props.updateRootStateVariable('selectedWelcomeImage', option?.text);
            }}
          />
          <br />
          <Label htmlFor={textFieldId}>What will your Virtual Assistant say if it does not understand the user?</Label>
          <TextField
            className={textFieldClassName}
            id={textFieldId}
            defaultValue="I am sorry, I didn't understand that"
            onChange={(ev?: any, newValue?: string) => {
              this.props.updateRootStateVariable('selectedFallbackText', newValue);
            }}
          />
          <br />
          <Label htmlFor={textFieldId}>Greeting Message</Label>
          <TextField
            className={textFieldClassName}
            id={textFieldId}
            defaultValue="Hi! My name is basic bot. Here are some things that I can do!"
            onChange={(ev?: any, newValue?: string) => {
              this.props.updateRootStateVariable('selectedGreetingMessage', newValue);
            }}
          />
          <br />
        </div>
      </ModalShell>
    );
  }
}

const mapStateToProps = (state: IAppState, ownProps: Props): StateProps => ({
  selectedLanguages: state.CreationState.selectedLanguages,
  selectedUserInput: state.CreationState.selectedUserInput,
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>): DispatchProps => ({
  updateRootStateVariable: (stateVariableName: string, value: any) => {
    dispatch(
      genericSingleAction<any>(actionTypes.UPDATE_ROOT_CREATION_STATE_VARIABlE, {
        propertyName: stateVariableName,
        value: value,
      })
    );
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(CustomizeBotPage);
