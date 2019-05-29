import React from 'react';
import PropTypes from 'prop-types';

export class OffsetContainer extends React.Component {
  render() {
    const { offset, children, styles } = this.props;
    if (!offset) return children;
    return (
      <div
        style={{
          position: 'absolute',
          left: offset.x,
          top: offset.y,
          transitionDuration: '50ms',
          transitionProperty: 'left, right, top, bottom',
          ...styles,
        }}
      >
        {children}
      </div>
    );
  }
}

OffsetContainer.defaultProps = {
  styles: {},
};

OffsetContainer.propTypes = {
  offset: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
  }),
  children: PropTypes.element,
};
