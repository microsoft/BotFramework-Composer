import React from 'react';
import { IAppState, ICreationState, IAvailableHostedSkill } from '../../../models/reduxState';
import { connect } from 'react-redux';
import { actionTypes, genericSingleAction } from '../../shared/actions';
import { Dispatch, AnyAction } from 'redux';
import { ModalShell } from './modalShell';
import { RouterPaths } from '../../shared/constants';
import { List } from 'office-ui-fabric-react/lib/List';
import { ChoiceGroup, IChoiceGroupOption, IChoiceGroupOptionStyleProps } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { Dropdown, IDropdownStyles, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { BotTypeTile } from './botTypeTile';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { Text, ITextProps } from 'office-ui-fabric-react/lib/Text';
import { mergeStyles, mergeStyleSets } from '@uifabric/merge-styles';
import { Separator, ISeparatorStyles } from 'office-ui-fabric-react/lib/Separator';

interface StateProps {
  creationState: ICreationState;
}

interface DispatchProps {}

interface Props {}

type PropsType = StateProps & DispatchProps & Props;

export class SummaryPage extends React.Component<PropsType> {
  constructor(props: PropsType) {
    super(props);
  }

  private categoryText = (text: string) => {
    let className = mergeStyles({
      display: 'block',
    });
    const separatorStyles: Partial<ISeparatorStyles> = {
      root: { color: 'black' },
    };
    return (
      <div>
        <br />
        <Text className={className} variant="xLarge">
          {text}
        </Text>
        <Separator styles={separatorStyles} />
      </div>
    );
  };

  private keyText = (text: string) => {
    let className = mergeStyles({
      fontWeight: '500',
    });

    return (
      <Text className={className} variant="mediumPlus">
        {text}
      </Text>
    );
  };

  private valueText = (text: string) => {
    let className = mergeStyles({
      // display: 'inline'
    });
    return (
      <Text className={className} variant="mediumPlus">
        {text}
      </Text>
    );
  };

  private renderSkillsList = () => {
    return (
      <div>
        {this.props.creationState.selectedSkills.map((selectedSkill: IAvailableHostedSkill) => {
          return <div>- {this.valueText(selectedSkill.name)}</div>;
        })}
      </div>
    );
  };

  render() {
    let KeyValueClassName = mergeStyles({
      display: 'block',
    });
    return (
      <ModalShell
        title="Creation Summary"
        subTitle="This outlines the experience to be created on your behalf, next we will run tooling to provision the resource needed to support this experience configuration"
        nextPath={RouterPaths.customizeBotModal as string}
      >
        <div>
          {this.categoryText('General')}
          <div className={KeyValueClassName}>
            {this.keyText('Selected Assistant Type: ')}
            {this.valueText(this.props.creationState.selectedAssistant.name)}
          </div>
          <div className={KeyValueClassName}>
            {this.keyText('Bot Name: ')}
            {this.valueText(this.props.creationState.selectedBotName)}
          </div>
          <div className={KeyValueClassName}>
            {this.keyText('Personality Choice: ')}
            {this.valueText(this.props.creationState.selectedPersonality)}
          </div>
          <div className={KeyValueClassName}>
            {this.keyText('Supported User Inputs: ')}
            {this.valueText(this.props.creationState.selectedUserInput.toString())}
          </div>
          <div className={KeyValueClassName}>
            {this.keyText('Supported User Languages: ')}
            {this.valueText(this.props.creationState.selectedLanguages.toString())}
          </div>
          {this.categoryText('Skills')}
          {this.renderSkillsList()}
          {this.categoryText('Content')}
          <div className={KeyValueClassName}>
            {this.keyText('Greeting Message: ')}
            {this.valueText(this.props.creationState.selectedGreetingMessage)}
          </div>
          <div className={KeyValueClassName}>
            {this.keyText('Welcome Image: ')}
            {this.valueText(this.props.creationState.selectedWelcomeImage)}
          </div>
          <div className={KeyValueClassName}>
            {this.keyText('Fallback Text: ')}
            {this.valueText(this.props.creationState.selectedFallbackText)}
          </div>
        </div>
      </ModalShell>
    );
  }
}

const mapStateToProps = (state: IAppState, ownProps: Props): StateProps => ({
  creationState: state.CreationState,
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>): DispatchProps => ({});

export default connect(mapStateToProps, mapDispatchToProps)(SummaryPage);
