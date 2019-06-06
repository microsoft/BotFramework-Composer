import PropTypes from 'prop-types';

export const NodeProps = {
  id: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
  focusedId: PropTypes.string.isRequired,
  onEvent: PropTypes.func.isRequired,
  onResize: PropTypes.func,
};

export const defaultNodeProps = {
  data: {},
  focusedId: '',
  onEvent: () => {},
  onResize: () => {},
};
