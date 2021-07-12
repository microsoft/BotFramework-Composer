// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { useCallback, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { FontSizes } from '@uifabric/fluent-theme';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { CopyableText } from '@bfc/ui-shared';

import { dispatcherState } from '../../recoilModel/atoms';
import { isTokenExpired } from '../../utils/auth';

export interface AuthDialogProps {
  needGraph: boolean;
  onDismiss: () => void;
}

const authDialogStyles = {
  dialog: {
    title: {
      fontWeight: FontWeights.bold,
      fontSize: FontSizes.size20,
      paddingTop: '14px',
      paddingBottom: '11px',
    },
    subText: {
      fontSize: FontSizes.size14,
    },
  },
  modal: {
    main: {
      maxWidth: '80% !important',
      width: '960px !important',
    },
  },
};
export const AuthDialog: React.FC<AuthDialogProps> = (props) => {
  const { setCurrentUser } = useRecoilValue(dispatcherState);

  const [graphToken, setLocalGraphToken] = useState('');
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

  const renderLabel = (props, defaultRender) => {
    return (
      <Stack>
        {defaultRender(props)}
        <CopyableText text={props.data} />
      </Stack>
    );
  };

  return (
    <Dialog
      dialogContentProps={{
        type: DialogType.close,
        title: formatMessage('Provide access tokens'),
        subText: formatMessage(
          'To perform provisioning and publishing actions, Composer requires access to your Azure and MS Graph accounts.  Paste access tokens from the az command line tool using the commands highlighted below.'
        ),
        styles: authDialogStyles.dialog,
      }}
      hidden={false}
      modalProps={{
        isBlocking: true,
        styles: authDialogStyles.modal,
      }}
      onDismiss={props.onDismiss}
    >
      <TextField
        multiline
        data="az account get-access-token"
        errorMessage={tokenError}
        label={formatMessage('Provide ARM token by running:')}
        placeholder={formatMessage('Paste token here')}
        rows={4}
        onChange={(event, newValue) => {
          newValue && setAccessToken(newValue);
          if (isTokenExpired(newValue || '')) {
            setTokenError('Token Expire or token invalid');
          } else {
            setTokenError('');
          }
        }}
        onRenderLabel={renderLabel}
      />
      {props.needGraph ? (
        <TextField
          multiline
          data="az account get-access-token  --resource-type ms-graph"
          errorMessage={graphError}
          label={formatMessage('Provide graph token by running:')}
          placeholder={formatMessage('Paste token here')}
          rows={4}
          onChange={(event, newValue) => {
            newValue && setLocalGraphToken(newValue);
            if (isTokenExpired(newValue || '')) {
              setGraphError('Token Expire or token invalid');
            } else {
              setGraphError('');
            }
          }}
          onRenderLabel={renderLabel}
        />
      ) : null}
      <DialogFooter>
        <DefaultButton text={formatMessage('Cancel')} onClick={props.onDismiss} />
        <PrimaryButton
          disabled={!isAble()}
          text={formatMessage('Continue')}
          onClick={() => {
            props.onDismiss();
            setCurrentUser(accessToken, graphToken);
          }}
        />
      </DialogFooter>
    </Dialog>
  );
};
