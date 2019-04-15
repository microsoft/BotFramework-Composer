import React from 'react';
import PropTypes from 'prop-types';
import { Modal as FabricModal, IconButton } from 'office-ui-fabric-react';

export default function Modal(props) {
  const { children, isOpen, onDismiss } = props;

  return (
    <FabricModal isOpen={isOpen} onDismiss={onDismiss} styles={{ main: { maxWidth: '500px', width: '100%' } }}>
      <div style={{ padding: '30px' }}>
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <IconButton iconProps={{ iconName: 'ChromeClose' }} title="Cancel" ariaLabel="Cancel" onClick={onDismiss} />
        </div>
        <div>{children}</div>
      </div>
    </FabricModal>
  );
}

Modal.propTypes = {
  children: PropTypes.node,
  isOpen: PropTypes.bool,
  onDismiss: PropTypes.func,
};

Modal.defaultProps = {
  isOpen: true,
  onDismiss: () => {},
};
