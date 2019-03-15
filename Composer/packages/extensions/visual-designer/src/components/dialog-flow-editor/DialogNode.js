import React, { Component } from 'react';
import PropTypes from 'prop-types';

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
    return (
      <div style={nodeStyle} onClick={() => data.onClick(data.json)}>
        {JSON.stringify(data.json)}
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
