// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
// import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
// import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import * as React from 'react';
import { useState, useMemo, useEffect, Fragment } from 'react';
// import formatMessage from 'format-message';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { getAccessTokensFromStorage } from '@bfc/extension-client';
import { Subscription, ResourceGroups, DeployLocation } from '@bfc/shared';

import { getSubscriptions, getResourceGroups, getDeployLocations } from './api';

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

export const AzureProvisionDialog: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [resourceGroups, setResourceGroups] = useState<ResourceGroups[]>([]);
  const [deployLocations, setDeployLocations] = useState<DeployLocation[]>([]);

  const [token, setToken] = useState<string>();

  const [currentSubscription, setSubscription] = useState<Subscription>();
  const [currentHostName, setHostName] = useState('');
  const [errorHostName, setErrorHostName] = useState('');
  const [currentLocation, setLocation] = useState<DeployLocation>();
  // const [selectedResources, setExternalResources] = useState<string[]>([]);
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

    const {access_token, graph_token} = getAccessTokensFromStorage();
    console.log('RECEIVED ACCeSS TOKENS FROM STORAGE', access_token, graph_token);
    setToken(access_token);
    getSubscriptions(access_token).then(setSubscriptions);
  }, []);

  const subscriptionOption = useMemo(() => {
    console.log('GOT SUBSCRIPTIONS', subscriptions);
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

  useEffect(() => {
    if (currentSubscription) {
      // get resource group under subscription
      getResourceGroups(token, currentSubscription.subscriptionId).then(setResourceGroups);
      getDeployLocations(token, currentSubscription.subscriptionId).then(setDeployLocations);
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
            label={'Subscription'}
            options={subscriptionOption}
            placeholder={'Select your subscription'}
            onChange={updateCurrentSubscription}
          />
          <TextField
            required
            errorMessage={errorHostName}
            label={'HostName'}
            placeholder={'Name of your new resource group'}
            onChange={newResourceGroup}
          />
          <Dropdown
            required
            label={'Locations'}
            options={deployLocationsOption}
            placeholder={'Select your location'}
            onChange={updateCurrentLocation}
          />

          {extensionResourceOptions.map((resource) => {
            return (
              <Fragment>
                {resource.key} = {resource.description}
              </Fragment>
              // <SettingToggle
              //   key={resource.key}
              //   checked={enabledResources[resource.key].enabled}
              //   description={resource.description}
              //   title={resource.text}
              //   onToggle={toggleResource(resource.key)}
              // />
            );
          })}
        </form>
      )}
      {(!subscriptionOption || !subscriptionOption.length) && <Fragment>LOADING</Fragment>}
      {/* <DialogFooter>
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
        </DialogFooter> */}
    </Fragment>
  );
};
