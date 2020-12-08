/** @jsx jsx */
import { jsx } from '@emotion/core';

import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';
import formatMessage from 'format-message';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { useCallback, useState } from 'react';
import storage from '../../utils/storage';
import { isTokenExpired } from '../../utils/auth';

export interface AuthDialogProps {
  needGraph: boolean;
  onDismiss: () => void;
  next: () => void;
}
export const AuthDialog: React.FC<AuthDialogProps> = (props) => {
  const [graphToken, setGraphToken] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [tokenError, setTokenError] = useState<string>('');
  const [graphError, setGraphError] = useState<string>('');
  const isAble = useCallback(() => {
    if (!accessToken) {
      return false;
    } else if (tokenError) {
      return false;
    }

    if (props.needGraph && (!graphToken || graphError)) {
      return false;
    }
    return true;
  }, [accessToken, graphToken]);

  return (
    <DialogWrapper
      isOpen
      onDismiss={props.onDismiss}
      title={formatMessage('Provide access tokens')}
      subText={formatMessage(
        'To perform provisioning and publishing actions, Composer requires access to your Azure and MS Graph accounts.  Paste access tokens from the az command line tool using the commands highlighted below.'
      )}
      dialogType={DialogTypes.CreateFlow}
      isBlocking={true}
    >
      <TextField
        onChange={(event, newValue) => {
          newValue && setAccessToken(newValue);
          if (isTokenExpired(newValue || '')) {
            setTokenError('Token Expire or token invalid');
          } else {
            setTokenError('');
          }
        }}
        errorMessage={tokenError}
        placeholder={formatMessage('Paste token here')}
        label={formatMessage('Provide ARM token by running `az account get-access-token`')}
        multiline
        rows={4}
      />
      {props.needGraph ? (
        <TextField
          onChange={(event, newValue) => {
            newValue && setGraphToken(newValue);
            if (isTokenExpired(newValue || '')) {
              setGraphError('Token Expire or token invalid');
            } else {
              setGraphError('');
            }
          }}
          errorMessage={graphError}
          placeholder={formatMessage('Paste token here')}
          label={formatMessage(
            'Provide graph token by running `az account get-access-token  --resource-type ms-graph`'
          )}
          multiline
          rows={4}
        />
      ) : null}
      <DialogFooter>
        <DefaultButton text={formatMessage('Cancel')} onClick={props.onDismiss} />
        <PrimaryButton
          disabled={!isAble()}
          text={formatMessage('Continue')}
          onClick={() => {
            props.onDismiss();
            // cache tokens
            storage.set('accessToken', accessToken);
            storage.set('graphToken', graphToken);
            props.next();
          }}
        />
      </DialogFooter>
    </DialogWrapper>
  );
};
