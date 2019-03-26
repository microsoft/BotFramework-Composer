import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { PAYLOAD_KEY } from '../../utils/constant';

const nodeStyle = {
  width: 200,
  height: 100,
  border: '1px solid lightgray',
  cursor: 'pointer',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#f6f6f6',
};

export class DialogNode extends Component {
  getLabel = payload => {
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

    return payload.$id;
  };

  render() {
    const { data } = this.props;
    const dialogPayload = data[PAYLOAD_KEY] || {};

    return (
      <div style={nodeStyle} onClick={() => data.onClick(dialogPayload)}>
        <div>{this.getLabel(dialogPayload)}</div>
        <div>{this.getSubLabel(dialogPayload)}</div>
      </div>
    );
  }
}

DialogNode.defaultProps = {
  data: {},
};

DialogNode.propTypes = {
  data: PropTypes.object,
};
