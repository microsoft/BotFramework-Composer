import React from 'react';
import { IAppState, IAvailableHostedSkill } from '../../../models/reduxState';
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
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { mergeStyles, mergeStyleSets } from '@uifabric/merge-styles';
import { Image } from 'office-ui-fabric-react/lib/Image';
import { Stack, IStackStyles, IStackTokens, IStackItemStyles } from 'office-ui-fabric-react/lib/Stack';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import { Text, ITextProps } from 'office-ui-fabric-react/lib/Text';

const skillsGif = require('../../shared/assets/pointOfInterest.gif');

interface StateProps {
  availableHostedSkills: IAvailableHostedSkill[];
  selectedSkills: IAvailableHostedSkill[];
}

interface DispatchProps {
  updateRootStateVariable: (stateVariableName: string, value: any) => void;
}

interface Props {}

type PropsType = StateProps & DispatchProps & Props;

export class AddSkillsPage extends React.Component<PropsType> {
  constructor(props: PropsType) {
    super(props);
  }

  private updateSelectedSkills(skill: IAvailableHostedSkill, isAdded?: boolean) {
    var resultArray = [...this.props.selectedSkills];
    if (isAdded) {
      resultArray.push(skill);
    } else {
      var indexToRemove = resultArray.indexOf(skill);
      if (indexToRemove !== -1) {
        resultArray.splice(indexToRemove, 1);
      }
    }
    this.props.updateRootStateVariable('selectedSkills', resultArray);
  }

  private skillTile = (skill: IAvailableHostedSkill) => {
    const checkBoxClassName = mergeStyles({
      display: 'inline-block',
    });

    return (
      <div key={skill.name}>
        <Checkbox
          className={checkBoxClassName}
          onChange={(ev?: any, checked?: boolean) => {
            this.updateSelectedSkills(skill, checked);
          }}
        />
        <BotTypeTile botName={skill.name} botDescription={skill.description} />
      </div>
    );
  };

  private renderImage = () => {
    const imageClassName = mergeStyles({
      display: 'inline-block',
      position: 'relative',
    });

    return <Image styles={{ image: { width: '80%', height: '80%' } }} className={imageClassName} src={skillsGif} />;
  };

  render() {
    const skillsContainer = mergeStyles({
      paddingTop: '30px',
    });
    return (
      <ModalShell
        title="Choose skills"
        subTitle="Skills are simple tasks that your Virtual Assistant can perform. For eg- Handle small talk, search bing, get weather updates, etc. 
            You can always add/remove this later in the Skill library."
        nextPath={RouterPaths.addQna}
        previousPath={RouterPaths.customizeBotModal}
      >
        <div className="ms-Grid " dir="ltr">
          <div className="ms-Grid-row">
            <div className={'ms-Grid-col ms-sm6 ms-md6 ms-lg8 ' + skillsContainer}>
              {this.props.availableHostedSkills.map((skill: IAvailableHostedSkill) => {
                return this.skillTile(skill);
              })}
            </div>
            <div className="ms-Grid-col ms-sm6 ms-md6 ms-lg4">
              {this.renderImage()}
              <Stack horizontal={true} tokens={{ childrenGap: 80 }}>
                <FontIcon iconName="ChevronLeft" />
                <Text variant="medium"> Point Of Interest </Text>
                <FontIcon iconName="ChevronRight" />
              </Stack>
            </div>
          </div>
        </div>
      </ModalShell>
    );
  }
}

const mapStateToProps = (state: IAppState, ownProps: Props): StateProps => ({
  availableHostedSkills: state.CreationState.availableHostedSkills,
  selectedSkills: state.CreationState.selectedSkills,
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

export default connect(mapStateToProps, mapDispatchToProps)(AddSkillsPage);
