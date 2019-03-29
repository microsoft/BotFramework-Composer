import React, { Fragment, Component } from 'react';
import PropTypes from 'prop-types';

import './DialogFlowEditor.css';
import { PAYLOAD_KEY } from '../../utils/constant';
import { isRecognizerType, isIntentType, isWelcomeType, isCallDialogType } from '../../utils/obiTypeInferrers';
import { Diamond } from '../nodes/templates/Diamond';
import { FormCard } from '../nodes/templates/FormCard';

export class DialogNode extends Component {
  createCallDialogLink = data => {
    const calleeDialog = data.dialog && data.dialog.$ref ? data.dialog.$ref : '';
    // TODO: OBI schema no longer uses file path as dialogref. Align with new schema when runtime supports it.
    const regexResult = calleeDialog.match(/.+\/(.+)\.dialog$/);
    const dialogName = regexResult && regexResult[1] ? regexResult[1] : calleeDialog;

    return (
      <span
        style={{
          cursor: 'pointer',
          color: 'blue',
        }}
        onClick={e => {
          e.stopPropagation();
          this.props.data.onClick({
            id: `${dialogName}`,
            payload: {
              $type: '$ref',
              $ref: calleeDialog,
            },
          });
        }}
      >
        {dialogName}
      </span>
    );
  };

  getLabel = payload => {
    if (isIntentType(payload.$type)) return '';

    if (isCallDialogType(payload.$type)) return '';

    if (payload.dialog) {
      if (payload.dialog.$type) {
        return payload.dialog.$type.split('Microsoft.')[1];
      }
    }
    return payload.$type.split('.')[1];
  };

  getSubLabel = payload => {
    if (isCallDialogType(payload.$type)) {
      return this.createCallDialogLink(payload);
    }

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
    const { $type } = payload;

    if (isIntentType($type)) {
      return 'Decision';
    }

    if (isWelcomeType($type)) {
      return 'Entry';
    }

    if (isCallDialogType($type)) {
      return 'CallDialog';
    }

    return '';
  };

  getHeaderColor = payload => {
    const { $type } = payload;

    if (isIntentType($type)) {
      return '#0078D4';
    }

    if (isWelcomeType($type)) {
      return '#3C3C3C';
    }

    if (isCallDialogType($type)) {
      return '#107C10';
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
            details={this.getSubLabel(dialogPayload)}
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
