// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { ITextFieldProps, TextField } from 'office-ui-fabric-react';
import formatMessage from 'format-message';

import { checkWebAppNameAvailability } from '../../api';
import { useDebounce } from '../useDebounce';

type Props = {
  onHostNameChange: (hostName: string, hasErrors: boolean) => void;
  accessToken: string;
  subscriptionId: string;
} & ITextFieldProps;

export const ResourceNameTextField = React.memo((props: Props) => {
  const { accessToken, subscriptionId, value, onHostNameChange } = props;
  const [error, setError] = React.useState<string>('');
  const [name, setName] = React.useState<string>(value);
  const debouncedHostName = useDebounce<string>(name, 500);

  React.useEffect(() => {
    if (subscriptionId && accessToken && debouncedHostName) {
      (async () => {
        const result = await checkWebAppNameAvailability(accessToken, debouncedHostName, subscriptionId);
        if (!result.nameAvailable) {
          setError(result.message);
        } else {
          setError('');
        }
      })();
    }
  }, [accessToken, subscriptionId, debouncedHostName]);

  React.useEffect(() => onHostNameChange?.(debouncedHostName, !!error), [error, debouncedHostName]);

  return (
    <TextField
      errorMessage={error}
      placeholder={formatMessage('Enter host name')}
      onChange={(_, newValue) => setName(newValue)}
      {...props}
      value={name}
    />
  );
});
