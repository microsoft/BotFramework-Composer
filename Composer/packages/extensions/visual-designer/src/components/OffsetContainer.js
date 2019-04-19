import React from 'react';
import PropTypes from 'prop-types';

export class OffsetContainer extends React.Component {
  render() {
    const { offset, children } = this.props;
    if (!offset) return children;
    return <div style={{ position: 'absolute', left: offset.x, top: offset.y }}>{children}</div>;
  }
}

OffsetContainer.propTypes = {
  offset: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
  }),
  children: PropTypes.element,
};
