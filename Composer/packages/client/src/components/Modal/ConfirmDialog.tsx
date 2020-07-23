// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import * as React from 'react';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import ReactDOM from 'react-dom';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { SharedColors } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';

import { dialogStyle } from './dialogStyle';

// -------------------- Styles -------------------- //
const normalStyle = css`
  padding: 15px;
  margin-bottom: 20px;
  white-space: pre-line;
`;

const consoleStyle = css`
  background: #000;
  max-height: 90px;
  overflow-y: auto;
  font-size: 16px;
  line-height: 23px;
  color: #fff;
  padding: 10px 15px;
  margin-bottom: 20px;
  white-space: pre-line;
`;

export const builtInStyles = {
  [dialogStyle.normal]: normalStyle,
  [dialogStyle.console]: consoleStyle,
};

export const dialog = {
  title: {
    fontWeight: FontWeights.bold,
  },
};

export const dialogModal = {
  main: {
    maxWidth: '600px !important',
  },
};

export const confirmationContainer = css`
  display: flex;
  flex-direction: column;
`;

export const confirmation = css`
  padding: 15px;
  margin-bottom: 20px;
  white-space: pre-line;
  background: ${SharedColors.red10};
`;

export const confirmationContent = css`
  width: 500px;
`;

// -------------------- ConfirmDialog -------------------- //

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
    confirmText = formatMessage('Yes'),
    cancelText = formatMessage('Cancel'),
    style = dialogStyle.normal,
    checkboxLabel,
    styles = { content: {}, main: {}, modal: {} },
  } = setting;

  const [disabled, setDisabled] = React.useState(setting.disabled);

  const handleCheckbox = (event, checked) => {
    setDisabled(!checked);
  };

  if (!title) {
    throw new Error(formatMessage('Confirmation modal must have a title.'));
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
