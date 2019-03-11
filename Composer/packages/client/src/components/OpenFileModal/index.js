/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { getId } from 'office-ui-fabric-react/lib/Utilities';
import './styles.css';
import { PropTypes } from 'prop-types';

function toggleModal(props) {
  props.setModalStatus(!props.modalStatus);
}

export const OpenFileModal = props => (
  <Modal
    titleAriaId={getId('title')}
    subtitleAriaId={getId('subText')}
    isOpen={props.modalStatus}
    onDismiss={() => toggleModal(props)}
    isModeless={true}
    containerClassName="ms-modal-container"
  >
    <div className="ms-modal-header">
      <span id="modal">Open Bot</span>
    </div>
    <div id="modal-content" className="ms-modal-body">
      <p>Please select the bot.</p>
      <DefaultButton onClick={() => toggleModal(props)} text="Close" />
    </div>
  </Modal>
);

OpenFileModal.propTypes = {
  modalStatus: PropTypes.boolean,
  setModalStatus: PropTypes.func,
};
