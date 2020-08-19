import { mergeStyles } from '@uifabric/merge-styles';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { Image } from 'office-ui-fabric-react/lib/Image';
import { Label } from 'office-ui-fabric-react/lib/Label';
import React from 'react';
import { connect } from 'react-redux';
import { AnyAction, Dispatch } from 'redux';
import { IAppState, IAssistant } from '../../../models/reduxState';
import { actionTypes, genericSingleAction } from '../../shared/actions';
import { RouterPaths } from '../../shared/constants';
import { BotTypeTile } from './botTypeTile';
import { ModalShell } from './modalShell';

const customImg = require('../../shared/assets/customAssistant.jpg');
const hospitalityImg = require('../../shared/assets/hospitality.jpg');
const enterpriseImg = require('../../shared/assets/EnterpriseAssistant.jpg');

interface StateProps {
  availableAssistants: IAssistant[];
  selectedAssistant: IAssistant;
}

interface DispatchProps {
  updateRootStateVariable: (stateVariableName: string, value: any) => void;
}

interface Props {}

type PropsType = StateProps & DispatchProps & Props;

export class NewBotPage extends React.Component<PropsType> {
  constructor(props: PropsType) {
    super(props);
  }

  private assistantSelectionChanged = (event: any, option?: IChoiceGroupOption) => {
    var selectedAssistant = this.props.availableAssistants.find((assistant: IAssistant) => {
      return assistant.name.toLowerCase() == option?.key.toLowerCase();
    });
    if (selectedAssistant) {
      console.log('in here');
      this.props.updateRootStateVariable('selectedAssistant', selectedAssistant);
    } else {
      // TODO log error
    }
  };

  private getAssistantsToRender = (): IChoiceGroupOption[] => {
    var result: IChoiceGroupOption[] = [];
    this.props.availableAssistants.forEach((assistant: IAssistant) => {
      result.push({
        key: assistant.name,
        text: '',
        onRenderField: (props, render) => {
          return (
            <div>
              {render!(props)}
              <BotTypeTile botName={assistant.name} botDescription={assistant.description} />
            </div>
          );
        },
      });
    });
    return result;
  };

  private renderImage = () => {
    const imageClassName = mergeStyles({
      display: 'inline-block',
      position: 'relative',
    });

    var assistantImage = null;
    switch (this.props.selectedAssistant.name) {
      case 'Custom Assistant':
        assistantImage = customImg;
        break;
      case 'Enterprise Assistant':
        assistantImage = enterpriseImg;
        break;
      case 'Hospitality Assistant':
        assistantImage = hospitalityImg;
        break;
    }
    return (
      <Image
        className={imageClassName}
        src={assistantImage ?? ''}
        alt="Example with no image fit value and no height or width is specified."
      />
    );
  };

  render() {
    console.log('in new bot change render');
    return (
      <ModalShell
        title="Create New"
        subTitle="Create a new bot or choose from Virtual assistant templates. Learn More"
        nextPath={RouterPaths.customizeBotModal as string}
      >
        <div className="ms-Grid" dir="ltr">
          <div className="ms-Grid-row">
            <div className="ms-Grid-col ms-sm6 ms-md6 ms-lg8">
              <Label>Choose one:</Label>
              <ChoiceGroup
                required={true}
                onChange={(event: any, option?: IChoiceGroupOption) => {
                  this.assistantSelectionChanged(event, option);
                }}
                styles={{
                  root: {
                    width: '100%',
                  },
                }}
                defaultSelectedKey={this.props.selectedAssistant.name}
                options={this.getAssistantsToRender()}
              />
            </div>
            <div className="ms-Grid-col ms-sm6 ms-md6 ms-lg4">{this.renderImage()}</div>
          </div>
        </div>
      </ModalShell>
    );
  }
}

const mapStateToProps = (state: IAppState, ownProps: Props): StateProps => ({
  availableAssistants: state.CreationState.availableAssistantTemplates,
  selectedAssistant: state.CreationState.selectedAssistant,
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

export default connect(mapStateToProps, mapDispatchToProps)(NewBotPage);
