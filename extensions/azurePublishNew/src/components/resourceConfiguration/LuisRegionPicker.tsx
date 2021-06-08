// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useState } from 'react';
import formatMessage from 'format-message';
import { DeployLocation } from '@botframework-composer/types';

import { AutoComplete, IAutoCompleteProps } from '../shared/autoComplete/AutoComplete';
import { getDeployLocations } from '../../api';

type Props = {
  allowCreation?: boolean;
  canRefresh?: boolean;
  accessToken: string;
  subscriptionId: string;
  onDeployLocationChange: React.Dispatch<React.SetStateAction<string>>;
} & Omit<IAutoCompleteProps, 'items' | 'onSubmit'>;

const messages = {
  placeholder: formatMessage('Select Region'),
};
export const LuisRegionPicker = React.memo((props: Props) => {
  const { accessToken, subscriptionId } = props;
  const [deployLocations, setDeployLocations] = useState<DeployLocation[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  useEffect(() => {
    if (accessToken) {
      setErrorMessage(undefined);
      setIsLoading(true);
      getDeployLocations(accessToken, subscriptionId)
        .then((data) => {
          setIsLoading(false);
          setDeployLocations(data);
        })
        .catch((err) => {
          setIsLoading(false);
          setErrorMessage(err.message);
        });
    }
  }, [accessToken]);

  const localTextFieldProps = { placeholder: messages.placeholder };

  const getValue = () => {
    return deployLocations.find((dl) => dl.id === props.value)?.displayName;
  };
  return (
    <AutoComplete
      errorMessage={errorMessage}
      isLoading={isLoading}
      items={deployLocations.map((t) => ({ key: t.id, text: t.displayName }))}
      onSubmit={(option) => props.onDeployLocationChange(option.key as string)}
      {...{ ...props, textFieldProps: { ...localTextFieldProps, ...props.textFieldProps }, value: getValue() }}
    />
  );
});
