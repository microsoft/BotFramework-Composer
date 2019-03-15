import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { PAYLOAD_KEY } from '../../utils/constant';

const nodeStyle = {
  width: 200,
  height: 100,
  border: '1px solid lightgray',
  cursor: 'pointer',
  overflow: 'hidden',
};

export class DialogNode extends Component {
  render() {
    const { data } = this.props;
    const dialogPayload = data[PAYLOAD_KEY];

    return (
      <div style={nodeStyle} onClick={() => data.onClick(dialogPayload)}>
        {JSON.stringify(dialogPayload)}
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
