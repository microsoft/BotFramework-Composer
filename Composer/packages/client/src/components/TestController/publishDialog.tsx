// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Dialog, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import formatMessage from 'format-message';

import { dialog, dialogModal } from '../../pages/language-understanding/styles';
import { PublishLuis } from '../../pages/language-understanding/publish-luis-modal';

interface IPublishLuisDialogProps {
  botName: string;
  isOpen: boolean;
  onDismiss: () => void;
  onPublish: () => void;
}

export const PublishLuisDialog: React.FC<IPublishLuisDialogProps> = props => {
  const { isOpen, onDismiss, onPublish, botName } = props;

  return (
    <Dialog
      dialogContentProps={{
        type: DialogType.normal,
        title: formatMessage('Publish LUIS models'),
        styles: dialog
      }}
      hidden={!isOpen}
      modalProps={{
        isBlocking: false,
        isModeless: true,
        styles: dialogModal
      }}
      onDismiss={onDismiss}
    >
      <PublishLuis botName={botName} onDismiss={onDismiss} onPublish={onPublish} />
    </Dialog>
  );
};
