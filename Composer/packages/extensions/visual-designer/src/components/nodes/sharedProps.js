import PropTypes from 'prop-types';

export const NodeProps = {
  id: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
  onTriggerEvent: PropTypes.func.isRequired,
};

export const defaultNodeProps = {
  data: {},
  onTriggerEvent: () => {},
};
