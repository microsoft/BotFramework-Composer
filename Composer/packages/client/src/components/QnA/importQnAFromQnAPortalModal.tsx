// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import formatMessage from 'format-message';
// import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
// import { Stack } from 'office-ui-fabric-react/lib/Stack';
// import { TextField } from 'office-ui-fabric-react/lib/TextField';
// import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
// import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { QnAFile } from '@bfc/shared';

// import { FieldConfig, useForm } from '../../hooks/useForm';
// import { getQnAFileUrlOption, getQnAFileMultiTurnOption } from '../../utils/qnaUtil';

// import { validateUrl } from './constants';
// import { styles, dialogWindow, textFieldKBNameFromScratch } from './styles';

type ImportQnAFromQnAPortalModalProps = {
  qnaFile: QnAFile;
  onDismiss: () => void;
  onSubmit: (formData: ImportQnAFromQnAPortalFormData) => void;
};

export type ImportQnAFromQnAPortalFormData = {
  azureDirectory: string;
  azureSubscription: string;
  services: string;
};

// const DialogTitle = () => {
//   return <div>{formatMessage('Choose QnA Resouce')}</div>;
// };

export const ImportQnAFromQnAPortalModal: React.FC<ImportQnAFromQnAPortalModalProps> = (props) => {
  //const { azureDirectory, azureSubscription, services } = props;
  return null;
  // <Dialog
  //   dialogContentProps={{
  //     type: DialogType.close,
  //     title: <DialogTitle />,
  //     styles: styles.dialog,
  //   }}
  //   hidden={false}
  //   modalProps={{
  //     isBlocking: false,
  //     styles: styles.modalCreateFromScratch,
  //   }}
  // >
  //   <div css={dialogWindow}>
  //   </div>
  // </Dialog>
};

export default ImportQnAFromQnAPortalModal;
