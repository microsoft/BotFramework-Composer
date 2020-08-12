// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';

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

const dialogStyle = {
  normal: 'NORMAL',
  console: 'CONSOLE',
};

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
    style?: string;
  };
  onConfirm: () => void;
};
export const FailedImportQnAModal = (props: Props) => {
  const { setting, onConfirm } = props;
  const { title, subtitle = '', confirmText = formatMessage('Ok'), style = dialogStyle.normal } = setting;

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
    >
      {subtitle && <div css={builtInStyles[style]}>{subtitle}</div>}

      <DialogFooter>
        <PrimaryButton text={confirmText} onClick={onConfirm} />
      </DialogFooter>
    </Dialog>
  );
};
