import React from 'react';
import { withRouter } from 'react-router-dom';
import { IAppState, WebChatStyleOption } from '../../../models/reduxState';
import { connect } from 'react-redux';
import { actionTypes, genericSingleAction } from '../../shared/actions';
import { Dispatch, AnyAction } from 'redux';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { defaultStyleOptions } from '../constants';
import { Link, MessageBar, MessageBarType } from 'office-ui-fabric-react';
import { DefaultButton, PrimaryButton, Stack, IStackTokens } from 'office-ui-fabric-react';
import { mergeStyles, mergeStyleSets } from '@uifabric/merge-styles';

interface StateProps {
  currentStyleOptions: WebChatStyleOption;
  jsonIsInvalid: boolean;
}

interface DispatchProps {
  updateStyleOptions: (styleOptions: WebChatStyleOption) => void;
  updateRootStateVariable: (stateVariableName: string, value: any) => void;
}

interface Props {}

interface LocalState {
  textValue: string;
}

type PropsType = StateProps & DispatchProps & Props;

export class WebChatJsonEditor extends React.Component<PropsType, LocalState> {
  constructor(props: PropsType) {
    super(props);
    this.state = { textValue: JSON.stringify(this.props.currentStyleOptions, null, 4) };
  }

  private onJsonChange = (event: any, newJson?: string) => {
    if (newJson) {
      this.setState({ textValue: newJson });

      var newStyleOptions: WebChatStyleOption;
      try {
        newStyleOptions = JSON.parse(newJson);
        this.props.updateRootStateVariable('jsonIsInvalid', false);
        this.props.updateRootStateVariable('styleOptions', newStyleOptions);
      } catch {
        this.props.updateRootStateVariable('jsonIsInvalid', true);
      }
    }
  };

  private renderErrorBanner = () => {
    if (this.props.jsonIsInvalid) {
      return (
        <MessageBar messageBarType={MessageBarType.error} isMultiline={false}>
          Invalid Json!
        </MessageBar>
      );
    }
  };

  private resetToDefault = (event: any) => {
    this.setState({ textValue: JSON.stringify(defaultStyleOptions, null, 4) });
    this.props.updateRootStateVariable('styleOptions', defaultStyleOptions);
  };

  render() {
    const resetButtonClassName = mergeStyles({
      float: 'right',
      marginTop: '20px',
    });

    return (
      <div>
        {this.renderErrorBanner()}
        <TextField
          onChange={(event: any, newValue?: string) => this.onJsonChange(event, newValue)}
          label=""
          multiline
          rows={40}
          value={this.state.textValue}
        />
        <PrimaryButton
          className={resetButtonClassName}
          onClick={(event: any) => {
            this.resetToDefault(event);
          }}
          text="Reset to default"
        />
      </div>
    );
  }
}

const mapStateToProps = (state: IAppState, ownProps: Props): StateProps => ({
  currentStyleOptions: state.WebChatState.styleOptions,
  jsonIsInvalid: state.WebChatState.jsonIsInvalid,
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>): DispatchProps => ({
  updateStyleOptions: (styleOptions: WebChatStyleOption) => {
    dispatch(
      genericSingleAction<any>(actionTypes.UPDATE_STYLE_OPTIONS, { styleOptions })
    );
  },
  updateRootStateVariable: (stateVariableName: string, value: any) => {
    dispatch(
      genericSingleAction<any>(actionTypes.UPDATE_ROOT_WEBCHAT_STATE_VARIABlE, {
        propertyName: stateVariableName,
        value: value,
      })
    );
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(WebChatJsonEditor);
