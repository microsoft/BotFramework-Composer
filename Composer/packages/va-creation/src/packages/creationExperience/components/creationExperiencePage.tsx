import { DefaultButton, Modal } from 'office-ui-fabric-react';
import React from 'react';
import { connect } from 'react-redux';
import { Link, Route, Switch } from 'react-router-dom';
import { AnyAction, Dispatch } from 'redux';
import { IAppState } from '../../../models/reduxState';
import AddQnaPage from './addQnaPage';
import AddSkillsPage from './addSkillsPage';
import CustomizeBotPage from './customizeBotPage';
import NewBotPage from './newBotPage';
import SummaryPage from './summaryPage';

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
