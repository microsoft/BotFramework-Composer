// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import * as React from 'react';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import ReactDOM from 'react-dom';

import { builtInStyles, dialog, dialogModal, confirmationContainer } from './styles';
import { dialogStyle } from './dialogStyle';

interface ConfirmDialogProps {
  onCancel: () => void;
  onConfirm: () => void;
  setting: any;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = (props) => {
  const { setting, onCancel, onConfirm } = props;
  const {
    title,
    subTitle = '',
    onRenderContent = defaultContentRender,
    confirmText = 'Yes',
    cancelText = 'Cancel',
    style = dialogStyle.normal,
    checkboxLabel,
    styles = { content: {}, main: {}, modal: {} },
  } = setting;

  const [disabled, setDisabled] = React.useState(setting.disabled);

  const handleCheckbox = (event, checked) => {
    setDisabled(!checked);
  };

  if (!title) {
    throw new Error('Confirmation modal must have a title');
  }

  function defaultContentRender() {
    return <div css={builtInStyles[style]}> {subTitle} </div>;
  }

  return (
    <Dialog
      dialogContentProps={{
        type: DialogType.normal,
        title: title,
        styles: dialog,
      }}
      hidden={false}
      modalProps={{
        isBlocking: true,
        styles: dialogModal,
      }}
      onDismiss={onCancel}
    >
      <div css={[confirmationContainer, styles.content]}>
        {onRenderContent(subTitle, builtInStyles[style])}
        {checkboxLabel && <Checkbox checked={!disabled} label={checkboxLabel} onChange={handleCheckbox} />}
      </div>
      <DialogFooter>
        <PrimaryButton data-testid="confirmPrompt" disabled={disabled} text={confirmText} onClick={onConfirm} />
        <DefaultButton data-testid="cancelPrompt" text={cancelText} onClick={onCancel} />
      </DialogFooter>
    </Dialog>
  );
};

export const OpenConfirmModal = (title, subTitle, setting = {}) => {
  return new Promise((resolve) => {
    const node = document.createElement('div');
    document.body.appendChild(node);
    const removeNode = () => {
      ReactDOM.unmountComponentAtNode(node);
    };

    const onConfirm = () => {
      removeNode();
      resolve(true);
    };
    const onCancel = () => {
      removeNode();
      resolve(false);
    };

    const modal = <ConfirmDialog setting={{ title, subTitle, ...setting }} onCancel={onCancel} onConfirm={onConfirm} />;
    ReactDOM.render(modal, node);
  });
};
