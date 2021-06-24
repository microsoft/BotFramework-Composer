// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';
import formatMessage from 'format-message';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import { PrimaryButton, DefaultButton, Button } from 'office-ui-fabric-react/lib/Button';
import { useRecoilValue } from 'recoil';
import { DialogSetting } from '@botframework-composer/types';

import { dispatcherState } from '../../recoilModel';
import { enableOrchestratorDialog } from '../../constants';

import { importOrchestrator } from './helper';

const learnMoreUrl = 'https://aka.ms/LearnMoreOrchestrator';

type OrchestratorProps = {
  projectId: string;
  onSubmit: (event: React.MouseEvent<HTMLElement | Button>, userSelected?: boolean) => Promise<void>;
  onBack?: (event: React.MouseEvent<HTMLElement | Button>) => void;
  hideBackButton?: boolean;
  runtime: DialogSetting['runtime'];
};

const EnableOrchestrator: React.FC<OrchestratorProps> = (props) => {
  const { projectId, onSubmit, onBack, hideBackButton = false, runtime } = props;
  const [enableOrchestrator, setEnableOrchestrator] = useState(true);
  const { setApplicationLevelError, reloadProject } = useRecoilValue(dispatcherState);
  const onChange = (ev, check) => {
    setEnableOrchestrator(check);
  };
  return (
    <Stack data-testid="orchestrator-skill">
      <StackItem styles={{ root: { height: 150, width: '90%' } }}>
        <div style={{ marginBottom: '16px' }}>
          {enableOrchestratorDialog.subText}
          <Link href={learnMoreUrl} target="_blank">
            <div>{formatMessage('Learn more about Orchestrator')}</div>
          </Link>
        </div>
        <Checkbox
          defaultChecked
          label={formatMessage(
            'Use Orchestrator for multi-bot projects (bots that consist of multiple bots or connect to skills).'
          )}
          styles={{ root: { margin: '20px 0' } }}
          onChange={onChange}
        />
      </StackItem>
      <Stack horizontal horizontalAlign="space-between">
        <Stack.Item>{!hideBackButton && <DefaultButton text={formatMessage('Back')} onClick={onBack} />}</Stack.Item>
        <Stack.Item align="end">
          <DefaultButton styles={{ root: { marginRight: '8px' } }} text={formatMessage('Skip')} onClick={onSubmit} />
          <PrimaryButton
            data-testid="import-orchestrator"
            text={formatMessage('Continue')}
            onClick={(event) => {
              onSubmit(event, enableOrchestrator);
              if (enableOrchestrator) {
                // TODO: Block UI from doing any work until import is complete. Item #7531
                importOrchestrator(projectId, runtime, reloadProject, setApplicationLevelError);
              }
            }}
          />
        </Stack.Item>
      </Stack>
    </Stack>
  );
};

export { OrchestratorProps, EnableOrchestrator };
