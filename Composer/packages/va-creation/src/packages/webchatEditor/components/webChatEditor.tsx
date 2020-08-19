import React from 'react';
import { withRouter } from 'react-router-dom';
import { IAppState } from '../../../models/reduxState';
import { connect } from 'react-redux';
import { WebChatContainerStyling } from '../styles';
import WebChat from './webChat';
import { mergeStyles, mergeStyleSets } from '@uifabric/merge-styles';
import { actionTypes, genericSingleAction } from '../../shared/actions';
import { Dispatch, AnyAction } from 'redux';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { CollapsibleHeader } from './collapsibleHeader';
import { ColorForm } from './colorForm';
import { FontForm } from './fontForm';
import { AvatarForm } from './avatarForm';
import { MiscForm } from './miscForm';
import { Pivot, PivotItem } from 'office-ui-fabric-react/lib/Pivot';
import WebChatJsonEditor from './webChatJsonEditor';

interface StateProps {}

interface DispatchProps {
  updateStyleElement: (styleElementName: string, value: any) => void;
}

interface Props {}

type PropsType = StateProps & DispatchProps & Props;

export class WebChatEditor extends React.Component<PropsType> {
  constructor(props: PropsType) {
    super(props);
  }

  render() {
    // TODO: uniform styling tactic
    let leftGridClassName = mergeStyles({
      width: '66% !important',
      height: '86vh',
      overflowY: 'scroll',
      marginTop: '20px',
    });

    let rightGridClassName = mergeStyles({
      width: '34% !important',
      paddingRight: '0px !important',
      paddingLeft: '0px !important',
      height: '100%',
    });

    const stackTokens = { childrenGap: 10 };

    return (
      <div>
        <div className={'ms-Grid-col ms-sm6 ms-md8 ms-lg10 ' + leftGridClassName}>
          <Pivot>
            <PivotItem
              headerText="Standard"
              headerButtonProps={{
                'data-order': 1,
                'data-title': 'Standard',
              }}
            >
              <Stack tokens={stackTokens}>
                <h4>Customize Your WebChat UI:</h4>
                <p>Edit your web chat look and feel</p>
                <CollapsibleHeader
                  headerText="Color Settings"
                  content={<ColorForm updateStyleElement={this.props.updateStyleElement} />}
                />
                <CollapsibleHeader
                  headerText="Font Settings"
                  content={<FontForm updateStyleElement={this.props.updateStyleElement} />}
                />
                <CollapsibleHeader
                  headerText="Avatar Settings"
                  content={<AvatarForm updateStyleElement={this.props.updateStyleElement} />}
                />
                <CollapsibleHeader
                  headerText="Misc. Settings"
                  content={<MiscForm updateStyleElement={this.props.updateStyleElement} />}
                />
              </Stack>{' '}
            </PivotItem>
            <PivotItem
              headerText="Code Editor"
              headerButtonProps={{
                'data-order': 2,
                'data-title': 'Code Editor',
              }}
            >
              <WebChatJsonEditor />
            </PivotItem>
          </Pivot>
        </div>
        <div className={'ms-Grid-col ms-sm6 ms-md4 ms-lg2 ' + rightGridClassName}>
          <WebChat />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: IAppState, ownProps: Props): StateProps => ({});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>): DispatchProps => ({
  updateStyleElement: (styleElementName: string, value: any) => {
    dispatch(
      genericSingleAction<any>(actionTypes.UPDATE_STYLE_ELEMENT, { styleElementName: styleElementName, value: value })
    );
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(WebChatEditor);
