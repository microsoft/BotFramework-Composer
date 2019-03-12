/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Fragment } from 'react';
import { getId } from 'office-ui-fabric-react/lib/Utilities';
import { PropTypes } from 'prop-types';

import { header, body } from './styles';

function toggleModal(props) {
  props.setModalStatus(!props.modalStatus);
}

export const OpenFileModal = props => (
  <Fragment>
    <Modal
      titleAriaId={getId('title')}
      subtitleAriaId={getId('subText')}
      isOpen={props.modalStatus}
      onDismiss={() => toggleModal(props)}
      isModeless={true}
    >
      <div css={header}>
        <span id="modal">Open Bot</span>
      </div>
      <div id="modal-content" css={body}>
        <p>Please select the bot.</p>
        <DefaultButton onClick={() => toggleModal(props)} text="Close" />
      </div>
    </Modal>
  </Fragment>
);

OpenFileModal.propTypes = {
  modalStatus: PropTypes.boolean,
  setModalStatus: PropTypes.func,
};
