// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import * as React from 'react';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import ReactDOM from 'react-dom';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import formatMessage from 'format-message';

export const dialogStyle = {
  normal: 'NORMAL',
  console: 'CONSOLE',
};

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

const builtInStyles = {
  [dialogStyle.normal]: normalStyle,
  [dialogStyle.console]: consoleStyle,
};

const dialog = {
  title: {
    fontWeight: FontWeights.bold,
  },
};

const dialogModal = {
  main: {
    maxWidth: '600px !important',
  },
};

const confirmationContainer = css`
  display: flex;
  flex-direction: column;
`;

// -------------------- ConfirmDialog -------------------- //

type ConfirmDialogProps = {
  onCancel: () => void;
  onConfirm: (choice?: string) => void;
  setting: Record<string, any> & { choiceGroup?: { options: IChoiceGroupOption[]; selectedKey: string } };
};

const ConfirmDialog: React.FC<ConfirmDialogProps> = (props) => {
  const { setting, onCancel, onConfirm } = props;
  const {
    choiceGroup,
    title,
    subTitle = '',
    onRenderContent = defaultContentRender,
    confirmText = formatMessage('Yes'),
    cancelText = formatMessage('Cancel'),
    style = dialogStyle.normal,
    checkboxLabel,
    styles = { content: {}, main: {}, modal: {} },
  } = setting;

  const [selectedChoice, setSelectedChoice] = React.useState(choiceGroup?.selectedKey);
  const [disabled, setDisabled] = React.useState(setting.disabled);

  const handleCheckbox = (event, checked) => {
    setDisabled(!checked);
  };

  const confirm = () => {
    onConfirm(selectedChoice);
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
        {choiceGroup && (
          <ChoiceGroup
            required
            options={choiceGroup.options}
            selectedKey={selectedChoice}
            onChange={(ev, opt) => {
              setSelectedChoice(opt?.key);
            }}
          />
        )}
      </div>
      <DialogFooter>
        <PrimaryButton data-testid="confirmPrompt" disabled={disabled} text={confirmText} onClick={confirm} />
        <DefaultButton data-testid="cancelPrompt" text={cancelText} onClick={onCancel} />
      </DialogFooter>
    </Dialog>
  );
};

export const OpenConfirmModal = (title, subTitle, setting = {}): Promise<boolean> => {
  return new Promise((resolve) => {
    const node = document.createElement('div');
    document.body.appendChild(node);
    const removeNode = () => {
      ReactDOM.unmountComponentAtNode(node);
      node.remove();
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

export const OpenConfirmModalWithChoices = (title, subTitle, setting = {}): Promise<{ choice?: string } | null> => {
  return new Promise((resolve) => {
    const node = document.createElement('div');
    document.body.appendChild(node);
    const removeNode = () => {
      ReactDOM.unmountComponentAtNode(node);
      node.remove();
    };

    const onConfirm = (choice?: string) => {
      removeNode();
      resolve({ choice });
    };
    const onCancel = () => {
      removeNode();
      resolve(null);
    };

    const modal = <ConfirmDialog setting={{ title, subTitle, ...setting }} onCancel={onCancel} onConfirm={onConfirm} />;
    ReactDOM.render(modal, node);
  });
};
