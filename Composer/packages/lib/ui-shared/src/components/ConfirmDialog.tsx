// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import * as React from 'react';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Checkbox, ICheckboxProps } from 'office-ui-fabric-react/lib/Checkbox';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
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

/**
 * When we want the user to check the box to confirm their action, in addition to confirming the dialog.
 */
type DoubleConfirmCheckboxProps = { kind: 'doubleConfirm'; checkboxLabel?: string };
/**
 * When we want to ask user for extra checks in addition to the original action confirmation.
 */
type AdditionalConfirmCheckboxProps = { kind: 'additionalConfirm' } & ICheckboxProps;

type CheckboxProps = DoubleConfirmCheckboxProps | AdditionalConfirmCheckboxProps;

const getDefaultAdditionalCheckboxValue = (checkboxProps?: CheckboxProps) => {
  if (checkboxProps?.kind === 'additionalConfirm') {
    const additionalCheckboxProps = checkboxProps as AdditionalConfirmCheckboxProps;

    return additionalCheckboxProps.checked || additionalCheckboxProps.defaultChecked || undefined;
  }

  return undefined;
};

type ConfirmDialogProps = {
  onCancel: () => void;
  onConfirm: (additionalCheck?: boolean) => void;
  setting: Record<string, any> & { checkboxProps?: CheckboxProps };
};

const ConfirmDialog: React.FC<ConfirmDialogProps> = (props) => {
  const { setting, onCancel, onConfirm } = props;
  const {
    title,
    subTitle = '',
    onRenderContent = defaultContentRender,
    confirmText = formatMessage('Yes'),
    cancelText = formatMessage('Cancel'),
    style = dialogStyle.normal,
    checkboxProps,
    styles = { content: {}, main: {}, modal: {} },
  } = setting;

  const [additionalCheckboxValue, setAdditionalCheckboxValue] = React.useState<boolean | undefined>(
    getDefaultAdditionalCheckboxValue(checkboxProps)
  );
  const [disabled, setDisabled] = React.useState(setting.disabled);

  const handleCheckbox = (event, checked) => {
    setDisabled(!checked);
  };

  const confirm = () => {
    onConfirm(additionalCheckboxValue);
  };

  if (!title) {
    throw new Error(formatMessage('Confirmation modal must have a title.'));
  }

  function defaultContentRender() {
    return <div css={builtInStyles[style]}> {subTitle} </div>;
  }

  const renderCheckbox = React.useCallback(() => {
    if (!checkboxProps) {
      return null;
    }

    return (
      <Stack styles={{ root: { margin: '16px 0' } }}>
        {checkboxProps.kind === 'doubleConfirm' ? (
          <Checkbox
            checked={!disabled}
            label={(checkboxProps as DoubleConfirmCheckboxProps).checkboxLabel}
            onChange={handleCheckbox}
          />
        ) : (
          <Checkbox
            {...(checkboxProps as AdditionalConfirmCheckboxProps)}
            checked={additionalCheckboxValue}
            onChange={(_, checked) => setAdditionalCheckboxValue(checked)}
          />
        )}
      </Stack>
    );
  }, [checkboxProps, disabled, additionalCheckboxValue]);

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
        {renderCheckbox()}
      </div>
      <DialogFooter>
        <PrimaryButton data-testid="confirmPrompt" disabled={disabled} text={confirmText} onClick={confirm} />
        <DefaultButton data-testid="cancelPrompt" text={cancelText} onClick={onCancel} />
      </DialogFooter>
    </Dialog>
  );
};

export const OpenConfirmModal = (
  title,
  subTitle,
  setting: Record<string, any> & { checkboxProps?: DoubleConfirmCheckboxProps } = {}
): Promise<boolean> => {
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

export const OpenConfirmModalWithCheckbox = (
  title,
  subTitle,
  setting: Record<string, any> & { checkboxProps?: CheckboxProps } = {}
): Promise<{ additionalConfirm?: boolean } | null> => {
  return new Promise((resolve) => {
    const node = document.createElement('div');
    document.body.appendChild(node);
    const removeNode = () => {
      ReactDOM.unmountComponentAtNode(node);
      node.remove();
    };

    const onConfirm = (additionalConfirm?: boolean) => {
      removeNode();
      resolve({ additionalConfirm });
    };
    const onCancel = () => {
      removeNode();
      resolve(null);
    };

    const modal = <ConfirmDialog setting={{ title, subTitle, ...setting }} onCancel={onCancel} onConfirm={onConfirm} />;
    ReactDOM.render(modal, node);
  });
};
