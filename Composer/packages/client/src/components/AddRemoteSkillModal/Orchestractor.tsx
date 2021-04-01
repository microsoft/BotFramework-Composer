// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, Fragment } from 'react';
import formatMessage from 'format-message';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { useRecoilValue } from 'recoil';

import { dispatcherState } from '../../recoilModel';
import { enableOrchestratorDialog } from '../../constants';

import { importOrchestractor } from './helper';

export const Orchestractor = (props) => {
  const { projectId, onSubmit, onBack } = props;
  const [enable, setEnable] = useState(false);
  const { setApplicationLevelError, reloadProject } = useRecoilValue(dispatcherState);
  const onChange = (ev, check) => {
    setEnable(check);
  };
  return (
    <Fragment>
      <Stack>
        <StackItem styles={{ root: { height: 300, width: '60%' } }}>
          <div style={{ marginBottom: '16px' }}>
            {enableOrchestratorDialog.content}
            <Link href="https://aka.ms/bf-composer-docs-publish-bot" target="_blank">
              {formatMessage('\n learn more about Orchestractor')}
            </Link>
          </div>
          <Checkbox
            label="Make Orchestrator my preferred recognizer for multi-bot projects"
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
                onSubmit(event, enable);
                if (enable) {
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
    </Fragment>
  );
};
