/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Fragment } from 'react';
import { PropTypes } from 'prop-types';

import { header, body, content, root } from './styles';

function toggleModal(props) {
  props.setModalStatus(!props.modalStatus);
}

export const OpenFileModal = props => (
  <Fragment>
    <Modal isOpen={props.modalStatus} onDismiss={() => toggleModal(props)} isModeless={true} css={root}>
      <div css={content}>
        <div css={header}>
          <span>Open Bot</span>
        </div>
        <div css={body}>
          <p>Please select the bot.</p>
          <DefaultButton onClick={() => toggleModal(props)} text="Close" />
        </div>
      </div>
    </Modal>
  </Fragment>
);

OpenFileModal.propTypes = {
  modalStatus: PropTypes.boolean,
  setModalStatus: PropTypes.func,
};
