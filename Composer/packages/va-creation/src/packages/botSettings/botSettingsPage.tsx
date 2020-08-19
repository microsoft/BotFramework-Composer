import React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { mergeStyles, mergeStyleSets } from '@uifabric/merge-styles';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Dropdown, DropdownMenuItemType, IDropdownStyles, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { IAppState } from '../../models/reduxState';
import WebChat from '../webchatEditor/components/webChat';

interface StateProps {}

interface DispatchProps {}

interface Props {}

type PropsType = StateProps & DispatchProps & Props;

export class BotSettingsPage extends React.Component<PropsType> {
  constructor(props: PropsType) {
    super(props);
  }

  private onUserInputChange = () => {};

  private onLanguageChange = () => {};

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

    // TODO: uniform styling tactic
    let leftGridClassName = mergeStyles({
      width: '66% !important',
      height: '100%',
    });

    let rightGridClassName = mergeStyles({
      width: '34% !important',
      paddingRight: '0px !important',
      paddingLeft: '0px !important',
      height: '100%',
    });

    return (
      <div>
        <div className={'ms-Grid-col ms-sm6 ms-md8 ms-lg10 ' + leftGridClassName}>
          <div>
            <br />
            <h4>Customize Your Bot:</h4>
            <p>Choose your bot's tone, flavor & personality</p>
            <Label htmlFor={textFieldId}>Bot Name</Label>
            <TextField className={textFieldClassName} id={textFieldId} />
            <br />
            <Label>User Input</Label>
            <Stack horizontal={true} tokens={stackTokens}>
              <Checkbox
                label="Text"
                defaultChecked
                onChange={() => {
                  this.onLanguageChange();
                }}
              />
              <Checkbox
                label="Speech"
                onChange={() => {
                  this.onLanguageChange();
                }}
              />
            </Stack>{' '}
            <br />
            <Label>Language</Label>
            <Stack horizontal={true} tokens={stackTokens}>
              <Checkbox
                label="English"
                defaultChecked
                onChange={() => {
                  this.onLanguageChange();
                }}
              />
              <Checkbox
                label="French"
                onChange={() => {
                  this.onLanguageChange();
                }}
              />
              <Checkbox label="Chinese" />
              <Checkbox label="Italian" />
              <Checkbox label="German" />
            </Stack>
            <Stack tokens={stackTokens}>
              <br />
              <Dropdown
                placeholder="Select an option"
                label="Personality"
                options={personalityOptions}
                styles={dropdownStyles}
              />
            </Stack>
            <br />
            <ChoiceGroup label="Choose Welcome Image" defaultSelectedKey="day" options={iconOptions} />
            <br />
            <Label htmlFor={textFieldId}>
              What will your Virtual Assistant say if it does not understand the user?
            </Label>
            <TextField
              className={textFieldClassName}
              id={textFieldId}
              defaultValue="I am sorry, I didn't understand that"
            />
            <br />
            <Label htmlFor={textFieldId}>Greeting Message</Label>
            <TextField
              className={textFieldClassName}
              id={textFieldId}
              defaultValue="Hi! My name is basic bot. Here are some things that I can do!"
            />
            <br />
            <Label htmlFor={textFieldId}>Add QNA source</Label>
            <TextField className={textFieldClassName} id={textFieldId} defaultValue="www.mysite.com/faq" />
          </div>
        </div>
        <div className={'ms-Grid-col ms-sm6 ms-md4 ms-lg2 ' + rightGridClassName}>
          <WebChat />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: IAppState, ownProps: Props): StateProps => ({});

const dispatchToProps: DispatchProps = {};

export default connect(mapStateToProps, dispatchToProps)(BotSettingsPage);
