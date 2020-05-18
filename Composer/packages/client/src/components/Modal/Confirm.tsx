// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import * as React from 'react';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import ReactDOM from 'react-dom';

import { DialogStyle, BuiltInStyles, dialog, dialogModal, confirmationContainer } from './styles';

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
    confirmBtnText = 'Yes',
    cancelBtnText = 'Cancel',
    style = DialogStyle.Normal,
    checkboxLabel,
    styles = { content: {}, main: {}, modal: {} },
  } = setting;

  const [disabled, setDisabled] = React.useState(setting.disabled);

  const handleCheckbox = (event, checked) => {
    setDisabled(!checked);
  };

  if (!title) {
    throw new Error('confirm modal must give a title');
  }

  function defaultContentRender() {
    return <div css={BuiltInStyles[style]}> {subTitle} </div>;
  }

  return (
    <Dialog
      hidden={false}
      onDismiss={onCancel}
      dialogContentProps={{
        type: DialogType.normal,
        title: title,
        styles: dialog,
      }}
      modalProps={{
        isBlocking: true,
        styles: dialogModal,
      }}
    >
      <div css={[confirmationContainer, styles.content]}>
        {onRenderContent(subTitle, BuiltInStyles[style])}
        {checkboxLabel && <Checkbox onChange={handleCheckbox} checked={!disabled} label={checkboxLabel} />}
      </div>
      <DialogFooter>
        <PrimaryButton data-testid="confirmPrompt" disabled={disabled} onClick={onConfirm} text={confirmBtnText} />
        <DefaultButton data-testid="cancelPrompt" onClick={onCancel} text={cancelBtnText} />
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

    const modal = <ConfirmDialog setting={{ title, subTitle, ...setting }} onConfirm={onConfirm} onCancel={onCancel} />;
    ReactDOM.render(modal, node);
  });
};
