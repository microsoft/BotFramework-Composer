import React from 'react';
import { Modal as FabricModal, IconButton } from 'office-ui-fabric-react';
import formatMessage from 'format-message';

interface ModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onDismiss: () => void;
}

const Modal: React.FunctionComponent<ModalProps> = props => {
  const { children, isOpen, onDismiss } = props;

  return (
    <FabricModal isOpen={isOpen} onDismiss={onDismiss} styles={{ main: { maxWidth: '500px', width: '100%' } }}>
      <div style={{ padding: '30px' }}>
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <IconButton
            iconProps={{ iconName: 'ChromeClose' }}
            title={formatMessage('Cancel')}
            ariaLabel={formatMessage('Cancel')}
            onClick={onDismiss}
          />
        </div>
        <div>{children}</div>
      </div>
    </FabricModal>
  );
};

Modal.defaultProps = {
  isOpen: true,
  onDismiss: () => {},
};

export default Modal;
