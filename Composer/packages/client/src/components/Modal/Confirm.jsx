// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { PropTypes } from 'prop-types';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import ReactDOM from 'react-dom';

import { DialogStyle, BuiltInStyles, dialog, dialogModal } from './styles';

const ConfirmDialog = props => {
  const { setting, onCancel, onConfirm } = props;
  const {
    title,
    subTitle = '',
    onRenderContent = defaultContentRender,
    confirmBtnText = 'Yes',
    cancelBtnText = 'Cancel',
    style = DialogStyle.normalStyle,
  } = setting;
  if (!title) {
    throw new Error('confirm modal must give a title');
  }

  function defaultContentRender() {
    return <div style={BuiltInStyles[style]}> {subTitle} </div>;
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
      {onRenderContent(subTitle, BuiltInStyles[style])}
      <DialogFooter>
        <PrimaryButton data-testid="confirmPrompt" onClick={onConfirm} text={confirmBtnText} />
        <DefaultButton data-testid="cancelPrompt" onClick={onCancel} text={cancelBtnText} />
      </DialogFooter>
    </Dialog>
  );
};

ConfirmDialog.propTypes = {
  setting: PropTypes.object,
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func,
};

export const OpenConfirmModal = (title, subTitle, setting = {}) => {
  return new Promise(resolve => {
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
