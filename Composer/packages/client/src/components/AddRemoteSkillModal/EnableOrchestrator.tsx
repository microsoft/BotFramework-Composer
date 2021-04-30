// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';
import formatMessage from 'format-message';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import { PrimaryButton, DefaultButton, Button } from 'office-ui-fabric-react/lib/Button';
import { useRecoilValue } from 'recoil';

import { dispatcherState } from '../../recoilModel';
import { enableOrchestratorDialog } from '../../constants';

import { importOrchestrator } from './helper';

const learnMoreUrl = 'https://aka.ms/bf-composer-docs-publish-bot';

type OrchestratorProps = {
  projectId: string;
  onSubmit: (event: React.MouseEvent<HTMLElement | Button>, userSelected?: boolean) => Promise<void>;
  onBack?: (event: React.MouseEvent<HTMLElement | Button>) => void;
  hideBackButton?: boolean;
};

const EnableOrchestrator: React.FC<OrchestratorProps> = (props) => {
  const { projectId, onSubmit, onBack, hideBackButton = false } = props;
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
        <Stack.Item>{!hideBackButton && <DefaultButton text={formatMessage('Back')} onClick={onBack} />}</Stack.Item>
        <Stack.Item align="end">
          <DefaultButton styles={{ root: { marginRight: '8px' } }} text={formatMessage('Skip')} onClick={onSubmit} />
          <PrimaryButton
            text={formatMessage('Continue')}
            onClick={(event) => {
              onSubmit(event, enableOrchestrator);
              if (enableOrchestrator) {
                // TODO: Block UI from doing any work until import is complete. Item #7531
                importOrchestrator(projectId, reloadProject, setApplicationLevelError);
              }
            }}
          />
        </Stack.Item>
      </Stack>
    </Stack>
  );
};

export { OrchestratorProps, EnableOrchestrator };
