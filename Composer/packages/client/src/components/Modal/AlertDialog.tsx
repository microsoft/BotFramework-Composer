// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import ReactDOM from 'react-dom';
import formatMessage from 'format-message';

import { colors } from '../../colors';

import { dialogStyle } from './dialogStyle';

// -------------------- Styles -------------------- //

const normalStyle = css`
  padding: 15px;
  margin-bottom: 20px;
  white-space: pre-line;
`;

const consoleStyle = css`
  background: ${colors.black};
  color: ${colors.textOnColor};
  max-height: 90px;
  overflow-y: auto;
  font-size: 16px;
  line-height: 23px;
  padding: 10px 15px;
  margin-bottom: 20px;
  white-space: pre-line;
`;

export const builtInStyles = {
  [dialogStyle.normal]: normalStyle,
  [dialogStyle.console]: consoleStyle,
};

// -------------------- AlertDialog -------------------- //

type Props = {
  setting: {
    title: string;
    subtitle?: string;
    confirmText?: string;
    cancelText?: string;
    style?: string;
  };
  onCancel: () => void;
  onConfirm: () => void;
};

const AlertDialog = (props: Props) => {
  const { setting, onCancel, onConfirm } = props;
  const { title, subtitle = '', confirmText = formatMessage('OK'), cancelText, style = dialogStyle.normal } = setting;
  if (!title) {
    throw new Error(formatMessage('Confirmation modal must have a title.'));
  }

  return (
    <Dialog
      dialogContentProps={{
        type: DialogType.normal,
        title: title,
        // subText: subTitle,
      }}
      hidden={false}
      minWidth={500}
      modalProps={{
        isBlocking: true,
        styles: {
          main: { maxWidth: 450 },
        },
      }}
      onDismiss={onCancel}
    >
      {subtitle && <div css={builtInStyles[style]}>{subtitle}</div>}

      <DialogFooter>
        {cancelText && <DefaultButton text={cancelText} theme={colors.fluentTheme} onClick={onCancel} />}
        <PrimaryButton text={confirmText} theme={colors.fluentTheme} onClick={onConfirm} />
      </DialogFooter>
    </Dialog>
  );
};

export const openAlertModal = (title, subtitle, setting = {}) => {
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

    const modal = <AlertDialog setting={{ title, subtitle, ...setting }} onCancel={onCancel} onConfirm={onConfirm} />;
    ReactDOM.render(modal, node);
  });
};
