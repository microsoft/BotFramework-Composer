// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Subscription } from '@azure/arm-subscriptions/esm/models';
import React, { useEffect, useState } from 'react';
import { IComboBoxProps, ComboBox } from 'office-ui-fabric-react';
import formatMessage from 'format-message';

import {
  getResourceList,
  getSubscriptions,
  getDeployLocations,
  getPreview,
  getLuisAuthoringRegions,
  CheckWebAppNameAvailability,
  getResourceGroups,
} from '../api';
type ComboBoxPropsWithOutOptions = Omit<IComboBoxProps, 'options'>;
type Props = {
  allowCreation?: boolean;
  canRefresh?: boolean; // not needed for subscriptions
  accessToken: string;
  onSubscriptionChange: React.Dispatch<React.SetStateAction<string>>;
} & ComboBoxPropsWithOutOptions;

export const SubscriptionPicker = React.memo((props: Props) => {
  const { accessToken } = props;
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>();
  useEffect(() => {
    if (accessToken) {
      setErrorMessage(undefined);
      getSubscriptions(accessToken)
        .then((data) => {
          setSubscriptions(data);
          if (data.length === 0) {
            setErrorMessage(
              formatMessage(
                'Your subscription list is empty, please add your subscription, or login with another account.'
              )
            );
          }
        })
        .catch((err) => {
          setErrorMessage(err.message);
        });
    }
  }, [accessToken]);
  return (
    <ComboBox
      required
      errorMessage={errorMessage}
      label="Subscriptions"
      options={subscriptions.map((t) => ({ key: t.subscriptionId, text: t.displayName }))}
      placeholder="Select subscription"
      onChange={(event, option) => props.onSubscriptionChange(option.id)}
      {...props}
    />
  );
});
