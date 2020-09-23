// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { useState, useMemo, useEffect, Fragment } from 'react';
import formatMessage from 'format-message';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { useRecoilValue } from 'recoil';
import { Subscription, DeployLocation } from '@bfc/shared';

import { subscriptionsState, resourceGroupsState, deployLocationsState, dispatcherState } from '../../recoilModel';
import { LoadingSpinner } from '../../components/LoadingSpinner';

import { SettingToggle } from './SettingToggle';

interface CreateNewResourceProps {
  onDismiss: () => void;
  onSubmit: (value) => void;
}
const extensionResourceOptions = [
  { key: 'cosmoDb', text: 'CosmoDb', description: 'Use CosmoDB to store your bot state' },
  {
    key: 'applicationInsight',
    text: 'ApplicationInsight',
    description: 'Track the performance of your app with app insights',
  },
  { key: 'luisAuthoring', text: 'Luis Authoring Resource', description: 'Author LUIS applications' },
  { key: 'luisPrediction', text: 'Luis Prediction Resource', description: 'Use LUIS in your bot' },
  { key: 'blobStorage', text: 'BlobStorage', description: 'Capture transcripts into Blob Storage' },
];

export const CreateNewResource: React.FC<CreateNewResourceProps> = (props) => {
  const subscriptions = useRecoilValue(subscriptionsState);
  const resourceGroups = useRecoilValue(resourceGroupsState);
  const deployLocations = useRecoilValue(deployLocationsState);

  const { getResourceGroups, getDeployLocations } = useRecoilValue(dispatcherState);
  const [currentSubscription, setSubscription] = useState<Subscription>();
  const [currentHostName, setHostName] = useState('');
  const [errorHostName, setErrorHostName] = useState('');
  const [currentLocation, setLocation] = useState<DeployLocation>();
  // const [selectedResources, setExternalResources] = useState<string[]>([]);
  const { getSubscriptions } = useRecoilValue(dispatcherState);
  const [enabledResources, setEnabledResources] = useState({});

  useEffect(() => {
    // Load the list of subscriptions for the dropdown....
    const enabled = {};
    extensionResourceOptions.forEach((resourceType) => {
      enabled[resourceType.key] = {
        enabled: true,
      };
    });
    setEnabledResources(enabled);
    getSubscriptions();
  }, []);

  const subscriptionOption = useMemo(() => {
    console.log(subscriptions);
    return subscriptions.map((t) => ({ key: t.subscriptionId, text: t.displayName }));
  }, [subscriptions]);

  const deployLocationsOption = useMemo((): IDropdownOption[] => {
    return deployLocations.map((t) => ({ key: t.id, text: t.displayName }));
  }, [deployLocations]);

  const updateCurrentSubscription = useMemo(
    () => (_e, option?: IDropdownOption) => {
      const sub = subscriptions.find((t) => t.subscriptionId === option?.key);

      if (sub) {
        setSubscription(sub);
      }
    },
    [subscriptions]
  );

  // const updateCurrentResoruceGroup = useMemo(
  //   () => (_e, option?: IDropdownOption) => {
  //     const group = resourceGroups.find((t) => t.id === option?.key);

  //     if (group) {
  //       setResourceGroup(group.name);
  //     }
  //   },
  //   [resourceGroups]
  // );

  const newResourceGroup = useMemo(
    () => (e, newName) => {
      // validate existed or not
      const existed = resourceGroups.find((t) => t.name === newName);
      if (existed) {
        setErrorHostName('this resource group already exist');
      } else {
        setErrorHostName('');
        setHostName(newName);
      }
    },
    [resourceGroups]
  );

  const updateCurrentLocation = useMemo(
    () => (_e, option?: IDropdownOption) => {
      const location = deployLocations.find((t) => t.id === option?.key);

      if (location) {
        setLocation(location);
      }
    },
    [deployLocations]
  );

  // const onSelectedResource = useMemo(
  //   () => (event, item?: IDropdownOption) => {
  //     if (item) {
  //       const newselected = item.selected
  //         ? [...selectedResources, item.key as string]
  //         : selectedResources.filter((key) => key !== item.key);
  //       setExternalResources(newselected);
  //       console.log(newselected);
  //     }
  //   },
  //   [selectedResources]
  // );

  useEffect(() => {
    if (currentSubscription) {
      // get resource group under subscription
      getResourceGroups(currentSubscription.subscriptionId);
      getDeployLocations(currentSubscription.subscriptionId);
    }
  }, [currentSubscription]);

  const toggleResource = (opt: string) => {
    return (enabled: boolean) => {
      enabledResources[opt].enabled = enabled;
      setEnabledResources(enabledResources);
    };
  };

  return (
    <Fragment>
      {subscriptionOption && subscriptionOption.length && (
        <form>
          <Dropdown
            required
            label={formatMessage('Subscription')}
            options={subscriptionOption}
            placeholder={formatMessage('Select your subscription')}
            onChange={updateCurrentSubscription}
          />
          <TextField
            required
            errorMessage={errorHostName}
            label={formatMessage('HostName')}
            placeholder={formatMessage('Name of your new resource group')}
            onChange={newResourceGroup}
          />
          <Dropdown
            required
            label={formatMessage('Locations')}
            options={deployLocationsOption}
            placeholder={formatMessage('Select your location')}
            onChange={updateCurrentLocation}
          />

          {extensionResourceOptions.map((resource) => {
            return (
              <SettingToggle
                key={resource.key}
                checked={enabledResources[resource.key].enabled}
                description={formatMessage(resource.description)}
                title={formatMessage(resource.text)}
                onToggle={toggleResource(resource.key)}
              />
            );
          })}
        </form>
      )}
      {(!subscriptionOption || !subscriptionOption.length) && <LoadingSpinner />}
      <DialogFooter>
        <DefaultButton text={formatMessage('Cancel')} onClick={props.onDismiss} />
        <PrimaryButton
          disabled={!currentSubscription || !currentHostName || errorHostName !== ''}
          text={formatMessage('Ok')}
          onClick={async () => {
            await props.onSubmit({
              subscription: currentSubscription,
              hostname: currentHostName,
              location: currentLocation,
              externalResources: enabledResources,
            });
          }}
        />
      </DialogFooter>
    </Fragment>
  );
};
