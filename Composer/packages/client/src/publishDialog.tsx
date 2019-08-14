/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Dialog, DialogType } from 'office-ui-fabric-react';
import formatMessage from 'format-message';

import { dialog, dialogModal } from './pages/language-understanding/styles';
import { PublishLuis } from './pages/language-understanding/publish-luis-modal';

interface PublishLuisDialogProps {
  botName: string;
  isOpen: boolean;
  onDismiss: () => void;
  onPublish: () => void;
}

export const PublishLuisDialog: React.FC<PublishLuisDialogProps> = props => {
  const { isOpen, onDismiss, onPublish, botName } = props;

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
      <PublishLuis onPublish={onPublish} onDismiss={onDismiss} botName={botName} />
    </Dialog>
  );
};
