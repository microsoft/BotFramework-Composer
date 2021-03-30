// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';
import formatMessage from 'format-message';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';

import { enableOrchestratorDialog } from '../../constants';

export const OrchestractorModal = (props) => {
  const { onDismiss, dialogId, onSubmit } = props;
  const [enable, setEnable] = useState(false);
  const onChange = (ev, check) => {
    setEnable(check);
  };
  return (
    <DialogWrapper
      isOpen
      dialogType={DialogTypes.CreateFlow}
      title={enableOrchestratorDialog.title}
      onDismiss={onDismiss}
    >
      <Stack>
        <div style={{ marginBottom: '16px' }}>
          {enableOrchestratorDialog.subText}({dialogId})
          <Link href="https://aka.ms/bf-composer-docs-publish-bot" target="_blank">
            {formatMessage(' learn more about Orchestractor')}
          </Link>
        </div>
        <Checkbox
          label="Make Orchestrator my preferred recognizer for multi-bot projects"
          styles={{ root: { margin: '20px 0' } }}
          onChange={onChange}
        />
        <StackItem align={'end'}>
          <PrimaryButton
            styles={{ root: { marginRight: '8px' } }}
            text={formatMessage('Continue')}
            onClick={(event) => {
              // download orchestrator
              onSubmit();
            }}
          />
          <DefaultButton text={formatMessage('Skip')} onClick={onSubmit} />
        </StackItem>
      </Stack>
    </DialogWrapper>
  );
};
