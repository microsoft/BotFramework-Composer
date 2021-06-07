// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Dialog, DialogFooter, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import React from 'react';
import formatMessage from 'format-message';
import { generateUniqueId } from '@bfc/shared';

import { colors } from '../../colors';

import { boldBlueText, dialogContent } from './style';

type ImportPromptToSaveModalProps = {
  existingProjectName: string | undefined;
  isCopyingContent: boolean;
  onDismiss: () => any;
  onImportAsNew: () => any;
  onUpdate: () => any;
};

const BoldBlue = ({ children }) => (
  <span key={generateUniqueId()} css={boldBlueText}>
    {children}
  </span>
);

export const ImportPromptToSaveModal: React.FC<ImportPromptToSaveModalProps> = (props) => {
  const { existingProjectName = '', onDismiss, onImportAsNew, onUpdate, isCopyingContent } = props;
  const dialogTitle = (
    <span>
      {formatMessage.rich('Do you want to update <b>{ existingProjectName }</b>', { b: BoldBlue, existingProjectName })}
    </span>
  );

  return (
    <Dialog
      dialogContentProps={{ title: dialogTitle, type: isCopyingContent ? DialogType.normal : DialogType.close }}
      hidden={false}
      minWidth={560}
      onDismiss={onDismiss}
    >
      <p css={dialogContent}>
        {formatMessage('Updating { existingProjectName } will overwrite the current bot content and create a backup.', {
          existingProjectName,
        })}
      </p>
      <DialogFooter
        styles={{ actionsRight: { display: 'flex', justifyContent: 'flex-end' }, action: { display: 'flex' } }}
      >
        {isCopyingContent && (
          <Spinner label={formatMessage('Setting things up...')} labelPosition={'left'} size={SpinnerSize.small} />
        )}
        <PrimaryButton
          disabled={isCopyingContent}
          text={formatMessage('Update')}
          theme={colors.fluentTheme}
          onClick={onUpdate}
        />
        <DefaultButton
          disabled={isCopyingContent}
          text={formatMessage('Import as new')}
          theme={colors.fluentTheme}
          onClick={onImportAsNew}
        />
      </DialogFooter>
    </Dialog>
  );
};
