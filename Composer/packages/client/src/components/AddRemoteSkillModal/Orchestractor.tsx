// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';
import formatMessage from 'format-message';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { useRecoilValue } from 'recoil';

import { dispatcherState } from '../../recoilModel';
import { enableOrchestratorDialog } from '../../constants';

import { importOrchestractor } from './helper';

const learnMoreUrl = 'https://aka.ms/bf-composer-docs-publish-bot';

export const Orchestractor = (props) => {
  const { projectId, onSubmit, onBack } = props;
  const [enableOrchestrator, setEnableOrchestrator] = useState(true);
  const { setApplicationLevelError, reloadProject } = useRecoilValue(dispatcherState);
  const onChange = (ev, check) => {
    setEnableOrchestrator(check);
  };
  return (
    <Stack>
      <StackItem styles={{ root: { height: 300, width: '60%' } }}>
        <div style={{ marginBottom: '16px' }}>
          {enableOrchestratorDialog.content}
          <Link href={learnMoreUrl} target="_blank">
            <div>{formatMessage('Learn more about Orchestractor')}</div>
          </Link>
        </div>
        <Checkbox
          defaultChecked
          label={formatMessage('Make Orchestrator my preferred recognizer for multi-bot projects')}
          styles={{ root: { margin: '20px 0' } }}
          onChange={onChange}
        />
      </StackItem>
      <Stack horizontal horizontalAlign="space-between">
        <DefaultButton text={formatMessage('Back')} onClick={onBack} />
        <span>
          <DefaultButton styles={{ root: { marginRight: '8px' } }} text={formatMessage('Skip')} onClick={onSubmit} />
          <PrimaryButton
            text={formatMessage('Continue')}
            onClick={(event) => {
              onSubmit(event, enableOrchestrator);
              if (enableOrchestrator) {
                // TODO. show notification
                // download orchestrator first
                importOrchestractor(projectId, reloadProject, setApplicationLevelError);
                // TODO. update notification
              }
            }}
          />
        </span>
      </Stack>
    </Stack>
  );
};
