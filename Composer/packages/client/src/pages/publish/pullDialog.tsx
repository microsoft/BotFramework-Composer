/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { PublishTarget } from '@botframework-composer/types';
import formatMessage from 'format-message';
import { Dialog, DialogFooter, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import React, { useCallback, useState } from 'react';

import { LoadingSpinner } from '../../components/LoadingSpinner';

type PullDialogProps = {
  hidden: boolean;
  onDismiss: () => void;
  projectId: string;
  selectedTarget: PublishTarget | undefined;
};

type PullDialogStatus = 'idle' | 'inProgress' | 'done' | 'error';

const boldText = css`
  font-weight: ${FontWeights.semibold};
  word-break: break-work;
`;

export const PullDialog: React.FC<PullDialogProps> = (props) => {
  const { hidden = true, onDismiss, projectId, selectedTarget } = props;
  const [status, setStatus] = useState<PullDialogStatus>('idle');
  const [error, setError] = useState<string>('');
  const [backupPath, setBackupPath] = useState<string>('');

  const pull = useCallback(() => {
    if (selectedTarget) {
      const doPull = async () => {
        // show spinner
        setStatus('inProgress');

        try {
          // wait for pull result from server
          const res = await fetch(`/api/publish/${projectId}/pull/${selectedTarget.name}`, {
            method: 'POST',
          });
          const { status } = res;
          if (status === 200) {
            const { backupLocation } = await res.json();
            // show complete
            setStatus('done');
            setBackupPath(backupLocation);
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

  const onCancelOrDone = useCallback(() => {
    setStatus('idle');
    onDismiss();
  }, [onDismiss]);

  if (hidden) {
    return null;
  }

  switch (status) {
    case 'inProgress':
      // TODO: show some fancy status like in import
      // show the blocking spinner
      return (
        <Dialog
          hidden={false}
          dialogContentProps={{ type: DialogType.normal, showCloseButton: false }}
          modalProps={{ isBlocking: true }}
        >
          <LoadingSpinner message={formatMessage('Pulling bot content...')} />
        </Dialog>
      );

    case 'done':
      // TODO: just show notification
      return (
        <Dialog
          hidden={false}
          dialogContentProps={{
            title: formatMessage('Pull complete'),
          }}
        >
          <p>{formatMessage('Your old bot content was backed up to:')}</p>
          <p css={boldText}>{backupPath}</p>
          <DialogFooter>
            <PrimaryButton text={formatMessage('Ok')} onClick={onCancelOrDone} />
          </DialogFooter>
        </Dialog>
      );

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

    case 'idle':
    default:
      return (
        <Dialog
          hidden={false}
          dialogContentProps={{
            title: formatMessage('Pull content?'),
            subText: formatMessage(
              'WARNING: Pulling bot content from the selected profile is a destructive operation. We will backup your old bot contents to a separate folder.'
            ),
            styles: {
              subText: {
                fontSize: 16,
              },
            },
            type: DialogType.close,
          }}
          minWidth={560}
          onDismiss={onCancelOrDone}
        >
          <DialogFooter>
            <DefaultButton text={formatMessage('Cancel')} onClick={onCancelOrDone} />
            <PrimaryButton text={formatMessage('Pull')} onClick={pull} />
          </DialogFooter>
        </Dialog>
      );
  }
};
