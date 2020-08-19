import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { IAppState } from '../../../models/reduxState';
import { connect } from 'react-redux';
import { actionTypes, genericSingleAction } from '../../shared/actions';
import { Dispatch, AnyAction } from 'redux';
import { useId, useBoolean } from '@uifabric/react-hooks';
import {
  getTheme,
  mergeStyleSets,
  FontWeights,
  ContextualMenu,
  Toggle,
  DefaultButton,
  Modal,
  IDragOptions,
  IconButton,
  IIconProps,
  PrimaryButton,
} from 'office-ui-fabric-react';
import { Home } from '../../home/home';
import { BotSettingsPage } from '../../botSettings/botSettingsPage';
import { WebChatEditor } from '../../webchatEditor/components/webChatEditor';
import NewBotPage from './newBotPage';
import { Link } from 'react-router-dom';
import CustomizeBotPage from './customizeBotPage';
import AddSkillsPage from './addSkillsPage';
import SummaryPage from './summaryPage';
import AddQnaPage from './addQnaPage';

interface StateProps {}

interface DispatchProps {}

interface Props {}

interface State {
  isModalOpen: boolean;
}

type PropsType = StateProps & DispatchProps & Props;

export class CreationExperiencePage extends React.Component<PropsType, State> {
  constructor(props: PropsType) {
    super(props);
    this.state = { isModalOpen: false };
  }

  render() {
    return (
      <div>
        <Link to="/creationExperience/newBot">
          <DefaultButton
            style={{ marginTop: '10px' }}
            onClick={(event: any) => {
              this.setState({ isModalOpen: !this.state.isModalOpen });
            }}
            text="Start Creation Experience"
          />
        </Link>
        <Modal
          isOpen={this.state.isModalOpen}
          onDismiss={(event: any) => {
            this.setState({ isModalOpen: !this.state.isModalOpen });
          }}
          isBlocking={false}
        >
          <Switch>
            <Route exact path="/creationExperience/summary" component={SummaryPage} />
            <Route path="/creationExperience/addQna" component={AddQnaPage} />
            <Route path="/creationExperience/addSkills" component={AddSkillsPage} />
            <Route path="/creationExperience/customizeBot" component={CustomizeBotPage} />
            <Route exact={true} path="/creationExperience/newBot" component={NewBotPage} />
          </Switch>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = (state: IAppState, ownProps: Props): StateProps => ({});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>): DispatchProps => ({});

export default connect(mapStateToProps, mapDispatchToProps)(CreationExperiencePage);
