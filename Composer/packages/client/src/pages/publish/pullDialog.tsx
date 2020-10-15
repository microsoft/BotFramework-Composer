import { PublishTarget } from '@botframework-composer/types';
import formatMessage from 'format-message';
import { DefaultButton, Dialog, DialogFooter, DialogType, PrimaryButton } from 'office-ui-fabric-react';
import React, { useCallback, useState } from 'react';
import { LoadingSpinner } from '../../components/LoadingSpinner';

type PullDialogProps = {
  hidden: boolean;
  onDismiss: () => void;
  projectId: string;
  selectedTarget: PublishTarget | undefined;
};

type PullDialogStatus = 'idle' | 'inProgress' | 'done' | 'upToDate' | 'error';

export const PullDialog: React.FC<PullDialogProps> = (props) => {
  const { hidden = true, onDismiss, projectId, selectedTarget } = props;
  const [status, setStatus] = useState<PullDialogStatus>('idle');
  const [error, setError] = useState<string>('');

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
          if (status === 304) {
            // content is up to date
            setStatus('upToDate');
            return;
          }
          if (status === 200) {
            // show complete
            setStatus('done');
            return;
          }

          // not what we expected
          setError(formatMessage(`Something happened while attempting to pull: ${res.statusText}`));
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
      return (
        <Dialog
          hidden={false}
          dialogContentProps={{
            title: formatMessage('Pull complete'),
          }}
        >
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
            title: formatMessage('Error'),
            subText: formatMessage(error),
          }}
        >
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
            title: 'Pull content?',
            subText:
              'WARNING: Pulling bot content from the selected profile is a destructive operation. We will store your old bot contents in <BOTPROJECT>/.backup',
          }}
        >
          <DialogFooter>
            <DefaultButton text={formatMessage('Cancel')} onClick={onCancelOrDone} />
            <PrimaryButton text={formatMessage('Pull')} onClick={pull} />
          </DialogFooter>
        </Dialog>
      );
  }
};
