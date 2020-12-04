// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { PublishTarget } from '@botframework-composer/types';
import formatMessage from 'format-message';
import React, { useCallback, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import axios from 'axios';

import { createNotification } from '../../recoilModel/dispatchers/notification';
import { ImportSuccessNotificationWrapper } from '../../components/ImportModal/ImportSuccessNotification';
import { dispatcherState, locationState } from '../../recoilModel';

import { PullFailedDialog } from './pullFailedDialog';
import { PullStatus } from './pullStatus';

type PullDialogProps = {
  onDismiss: () => void;
  projectId: string;
  selectedTarget: PublishTarget | undefined;
};

type PullDialogStatus = 'connecting' | 'downloading' | 'error';

const CONNECTING_STATUS_DISPLAY_TIME = 2000;

export const PullDialog: React.FC<PullDialogProps> = (props) => {
  const { onDismiss, projectId, selectedTarget } = props;
  const [status, setStatus] = useState<PullDialogStatus>('connecting');
  const [error, setError] = useState<string>('');
  const { addNotification, reloadProject } = useRecoilValue(dispatcherState);
  const botLocation = useRecoilValue(locationState(projectId));

  const pull = useCallback(() => {
    if (selectedTarget) {
      const doPull = async () => {
        // show progress dialog
        setStatus('downloading');

        try {
          // wait for pull result from server
          const res = await axios.post<{ backupLocation: string }>(
            `/api/publish/${projectId}/pull/${selectedTarget.name}`
          );
          const { backupLocation } = res.data;
          // show notification indicating success and close dialog
          const notification = createNotification({
            type: 'success',
            title: '',
            onRenderCardContent: ImportSuccessNotificationWrapper({
              importedToExisting: true,
              location: backupLocation,
            }),
          });
          addNotification(notification);
          // reload the bot project to update the authoring canvas
          reloadProject(projectId);
          onDismiss();
          return;
        } catch (e) {
          // something bad happened
          setError(formatMessage('Something happened while attempting to pull: { e }', { e }));
          setStatus('error');
        }
      };
      doPull();
    }
  }, [botLocation, projectId, selectedTarget]);

  useEffect(() => {
    if (status === 'connecting') {
      // start the pull
      setTimeout(() => {
        pull();
      }, CONNECTING_STATUS_DISPLAY_TIME);
    }
  }, [status]);

  const onCancelOrDone = useCallback(() => {
    setStatus('connecting');
    onDismiss();
  }, [onDismiss]);

  switch (status) {
    case 'connecting':
      return <PullStatus publishTarget={selectedTarget} state={'connecting'} />;

    case 'downloading':
      return <PullStatus publishTarget={selectedTarget} state={'downloading'} />;

    case 'error':
      return <PullFailedDialog error={error} selectedTargetName={selectedTarget?.name} onDismiss={onCancelOrDone} />;

    default:
      throw new Error(`PullDialog trying to render for unexpected status: ${status}`);
  }
};
