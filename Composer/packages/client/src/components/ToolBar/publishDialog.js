/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Dialog, DialogType } from 'office-ui-fabric-react';
import formatMessage from 'format-message';
import { PropTypes } from 'prop-types';

import { dialog, dialogModal } from './../../pages/language-understanding/styles';
import { PublishLuis } from './../../pages/language-understanding/publish-luis-modal';

export function PublishLuisDialog(props) {
  const { isOpen, onDismiss, onPublish } = props;

  return (
    <Dialog
      hidden={!isOpen}
      onDismiss={onDismiss}
      dialogContentProps={{
        type: DialogType.normal,
        title: formatMessage('Publish LUIS models'),
        styles: dialog,
      }}
      modalProps={{
        isBlocking: false,
        styles: dialogModal,
      }}
    >
      <PublishLuis onPublish={onPublish} onDismiss={onDismiss} />
    </Dialog>
  );
}

PublishLuisDialog.propTypes = {
  isOpen: PropTypes.bool,
  onDismiss: PropTypes.func,
  onPublish: PropTypes.func,
};
