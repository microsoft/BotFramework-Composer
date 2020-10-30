/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { PublishTarget } from '@botframework-composer/types';
import formatMessage from 'format-message';
import { Dialog, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import React, { useCallback, useEffect, useState } from 'react';

import { createNotification } from '../../recoilModel/dispatchers/notification';
import { ImportSuccessNotification } from '../../components/ImportModal/ImportSuccessNotification';
import { useRecoilValue } from 'recoil';
import { dispatcherState } from '../../recoilModel';
import { PullStatus } from './pullStatus';

type PullDialogProps = {
  onDismiss: () => void;
  projectId: string;
  selectedTarget: PublishTarget | undefined;
};

type PullDialogStatus = 'connecting' | 'downloading' | 'error';

const boldText = css`
  font-weight: ${FontWeights.semibold};
  word-break: break-work;
`;

const CONNECTING_STATUS_DISPLAY_TIME = 2000;

export const PullDialog: React.FC<PullDialogProps> = (props) => {
  const { onDismiss, projectId, selectedTarget } = props;
  const [status, setStatus] = useState<PullDialogStatus>('connecting');
  const [error, setError] = useState<string>('');
  const { addNotification } = useRecoilValue(dispatcherState);

  // TODO: pull needs to be broken down into a previous auth step so the UI can reflect status
  // properly like in import flow
  const pull = useCallback(() => {
    if (selectedTarget) {
      const doPull = async () => {
        // show progress dialog
        setStatus('downloading');

        try {
          console.log('doing the pull');
          // wait for pull result from server
          const res = await fetch(`/api/publish/${projectId}/pull/${selectedTarget.name}`, {
            method: 'POST',
          });
          console.log('got pull result back: ', res);
          if (res.status && res.status === 200) {
            const { backupLocation } = await res.json();
            // show notification indicating success and close dialog
            const notification = createNotification({
              type: 'success',
              title: '',
              onRenderCardContent: ImportSuccessNotification({
                importedToExisting: true,
                location: backupLocation,
              }),
            });
            addNotification(notification);
            onDismiss();
            return;
          }

          // not what we expected
          const { message } = await res.json();
          setError(formatMessage('Something happened while attempting to pull: ') + message);
          setStatus('error');
        } catch (e) {
          // something bad happened
          setError(e);
          setStatus('error');
        }
      };
      doPull();
    }
  }, [projectId, selectedTarget]);

  useEffect(() => {
    if (status === 'connecting') {
      // start the pull
      console.log('starting pull');
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
      return <PullStatus state={'connecting'} publishTarget={selectedTarget} />;

    case 'downloading':
      return <PullStatus state={'downloading'} publishTarget={selectedTarget} />;

    case 'error':
      return (
        <Dialog
          hidden={false}
          dialogContentProps={{
            title: formatMessage('Something went wrong'),
            styles: {
              content: {
                fontSize: 16,
              },
            },
          }}
        >
          <p>
            {formatMessage('There was an unexpected error pulling from publish profile ')}
            <span css={boldText}>{selectedTarget?.name}</span>
          </p>
          <p css={boldText}>{typeof error === 'object' ? JSON.stringify(error, undefined, 2) : error}</p>
          <DialogFooter>
            <PrimaryButton text={formatMessage('Ok')} onClick={onCancelOrDone} />
          </DialogFooter>
        </Dialog>
      );

    default:
      return <div style={{ display: 'none' }}></div>;
  }
};
