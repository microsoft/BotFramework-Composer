import React, { Fragment, Component } from 'react';
import PropTypes from 'prop-types';

import './DialogFlowEditor.css';
import { PAYLOAD_KEY } from '../../utils/constant';
import { Diamond } from '../nodes/templates/Diamond';
import { FormCard } from '../nodes/templates/FormCard';

const nodeStyle = {
  width: 150,
  height: 150,
  fontSize: '20px',
  cursor: 'pointer',
  overflow: 'hidden',
  backgroundColor: '#f6f6f6',
  borderRadius: '1.15427px',
  boxShadow: '0px 0.692561px 2.07768px rgba(0, 0, 0, 0.108), 0px 3.69366px 8.31073px rgba(0, 0, 0, 0.132)',
};

export class DialogNode extends Component {
  getLabel = payload => {
    if (payload.$type.indexOf('Intent') !== -1) return '';
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
    if (payload.$type.indexOf('Intent') !== -1) {
      return 'Decision';
    }

    if (payload.$type.indexOf('Welcome') !== -1) {
      return 'Entry';
    }
  };

  getHeaderColor = payload => {
    if (payload.$type.indexOf('Intent') !== -1) {
      return '#0078D4';
    }

    if (payload.$type.indexOf('Welcome') !== -1) {
      return '#3C3C3C';
    }

    return '#00B294';
  };

  isBranch = payload => {
    // todo: for all recognizers and conditional dialogs, use a branch node
    return payload.$type.indexOf('Recognizer') !== -1;
  };
  render() {
    const { data } = this.props;
    const dialogPayload = data[PAYLOAD_KEY] || {};
    const onClickContent = () => data.onClick({ id: data.id, payload: dialogPayload });

    // todo: this logic to configure the UI for these nodes should be via a function like below:
    // const { header, color, label, subLabel } = this.getNodeOptions(dialogPayload);

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
