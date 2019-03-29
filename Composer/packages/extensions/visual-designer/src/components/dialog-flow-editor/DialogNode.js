import React, { Fragment, Component } from 'react';
import PropTypes from 'prop-types';

import './DialogFlowEditor.css';
import { PAYLOAD_KEY } from '../../utils/constant';
import { isRecognizerType, isIntentType, isWelcomeType, isCallDialogType } from '../../utils/obiTypeInferrers';
import { Diamond } from '../nodes/templates/Diamond';
import { FormCard } from '../nodes/templates/FormCard';

export class DialogNode extends Component {
  getLabel = payload => {
    if (isIntentType(payload.$type)) return '';
    if (payload.dialog) {
      if (payload.dialog.$type) {
        return payload.dialog.$type.split('Microsoft.')[1];
      }
    }
    return payload.$type.split('.')[1];
  };

  getSubLabel = payload => {
    if (payload.dialog && payload.dialog.$id) {
      return payload.$id;
    }

    if (payload.activity) {
      return payload.activity;
    }

    if (payload.intent) {
      return payload.intent;
    }

    if (payload.property) {
      return payload.property;
    }

    return payload.$id;
  };

  getHeader = payload => {
    if (isIntentType(payload.$type)) {
      return 'Decision';
    }

    if (isWelcomeType(payload.$type)) {
      return 'Entry';
    }
  };

  getHeaderColor = payload => {
    if (isIntentType(payload.$type)) {
      return '#0078D4';
    }

    if (isWelcomeType(payload.$type)) {
      return '#3C3C3C';
    }

    return '#00B294';
  };

  isBranch = payload => {
    // todo: for all recognizers and conditional dialogs, use a branch node
    return isRecognizerType(payload.$type);
  };
  render() {
    const { data } = this.props;
    const dialogPayload = data[PAYLOAD_KEY] || {};
    const onClickContent = () => data.onClick({ id: data.id, payload: dialogPayload });

    return (
      <Fragment>
        {!this.isBranch(dialogPayload) ? (
          <FormCard
            themeColor={this.getHeaderColor(dialogPayload)}
            header={this.getHeader(dialogPayload)}
            label={this.getLabel(dialogPayload)}
            sublabel={this.getSubLabel(dialogPayload)}
            onClick={onClickContent}
          />
        ) : (
          <Diamond onClick={onClickContent} />
        )}
      </Fragment>
    );
  }
}

DialogNode.defaultProps = {
  data: {},
};

DialogNode.propTypes = {
  data: PropTypes.object,
};
