// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useState } from 'react';
import formatMessage from 'format-message';
import { DeployLocation } from '@botframework-composer/types';
import sortBy from 'lodash/sortBy';

import { SearchableDropdown, SearchableDropdownProps } from '../shared/searchableDropdown/SearchableDropdown';
import { getDeployLocations } from '../../api';

type Props = {
  allowCreation?: boolean;
  canRefresh?: boolean;
  accessToken: string;
  subscriptionId: string;
  onDeployLocationChange: (location: string) => void;
  onDeployLocationsFetch?: (deployLocations: DeployLocation[]) => void;
} & Omit<SearchableDropdownProps, 'items' | 'onSubmit'>;

export const DeployLocationPicker = React.memo((props: Props) => {
  const { accessToken, subscriptionId, onDeployLocationsFetch } = props;
  const [deployLocations, setDeployLocations] = useState<DeployLocation[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    onDeployLocationsFetch?.(deployLocations);
  }, [deployLocations]);

  useEffect(() => {
    if (accessToken && subscriptionId) {
      setErrorMessage(undefined);
      setIsLoading(true);
      (async () => {
        try {
          const deployLocations = await getDeployLocations(accessToken, subscriptionId);
          setDeployLocations(deployLocations);
          setIsLoading(false);
        } catch (ex) {
          setDeployLocations([]);
          setIsLoading(false);
          setErrorMessage(ex.message);
        }
      })();
    }
  }, [accessToken, subscriptionId]);

  const localTextFieldProps = React.useMemo(
    () => ({
      placeHolder: formatMessage('Select Region'),
      errorMessage,
    }),
    [errorMessage]
  );

  return (
    <SearchableDropdown
      isLoading={isLoading}
      items={sortBy(
        deployLocations.map((t) => ({ key: t.name, text: t.displayName })),
        [(location) => location.text]
      )}
      onSubmit={(option) => props.onDeployLocationChange(option.key)}
      {...{
        ...props,
        textFieldProps: { ...localTextFieldProps, ...props.textFieldProps },
        value: deployLocations.find((dl) => dl.name === props.value)?.displayName,
      }}
    />
  );
});
