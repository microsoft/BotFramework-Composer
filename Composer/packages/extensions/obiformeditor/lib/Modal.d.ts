import React from 'react';
interface ModalProps {
  children: React.ReactNode;
  isOpen?: boolean;
  onDismiss: () => void;
}
declare const Modal: React.FunctionComponent<ModalProps>;
export default Modal;
