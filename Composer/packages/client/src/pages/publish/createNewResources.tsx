// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { useState, useMemo, useContext, useEffect, Fragment } from 'react';
import formatMessage from 'format-message';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { TextField } from 'office-ui-fabric-react/lib/TextField';

import { StoreContext } from '../../store';
import { Subscription, DeployLocation } from '../../store/types';

interface CreateNewResourceProps {
  onDismiss: () => void;
  onSubmit: (value) => void;
}

const extenstionResourceOptions = [
  { key: 'cosmoDb', text: 'CosmoDb' },
  { key: 'applicationInsight', text: 'ApplicationInsight' },
  { key: 'luisAuthoring', text: 'Luis Authoring Resource' },
  { key: 'luisPrediction', text: 'Luis Prediction Resource' },
  { key: 'blobStorage', text: 'BlobStorage' },
];

export const CreateNewResource: React.FC<CreateNewResourceProps> = (props) => {
  const { state, actions } = useContext(StoreContext);
  const { subscriptions, resourceGroups, deployLocations } = state;
  const [currentSubscription, setSubscription] = useState<Subscription>();
  const [currentHostName, setHostName] = useState('');
  // const [password, setPassword] = useState('');
  const [errorHostName, setErrorHostName] = useState('');
  // const [errorPassword, setErrorPassword] = useState('');
  const [currentLocation, setLocation] = useState<DeployLocation>();
  const [selectedResources, setExternalResources] = useState<string[]>([]);

  const subscriptionOption = useMemo(() => {
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

  // const updatePassword = useMemo(
  //   () => (e, newValue) => {
  //     const patt = /^(?![0-9]+$)(?![a-zA-Z]+$)(?![a-zA-Z0-9]+$)[\w$&~!*@#%^{}|]{16,}$/;
  //     if (newValue.length <= 16 && !patt.test(newValue)) {
  //       setPassword(newValue);
  //       setErrorPassword('Password need to include characters, number and special-characters, 16 characters length');
  //     } else if (newValue.length === 16) {
  //       setErrorPassword('');
  //       setPassword(newValue);
  //     }
  //   },
  //   []
  // );

  const updateCurrentLocation = useMemo(
    () => (_e, option?: IDropdownOption) => {
      const location = deployLocations.find((t) => t.id === option?.key);

      if (location) {
        setLocation(location);
      }
    },
    [deployLocations]
  );

  const onSelectedResource = useMemo(
    () => (event, item?: IDropdownOption) => {
      if (item) {
        const newselected = item.selected
          ? [...selectedResources, item.key as string]
          : selectedResources.filter((key) => key !== item.key);
        setExternalResources(newselected);
        console.log(newselected);
      }
    },
    [selectedResources]
  );

  useEffect(() => {
    if (currentSubscription) {
      // get resource group under subscription
      actions.getResourceGroups(currentSubscription.subscriptionId);
      actions.getDeployLocations(currentSubscription.subscriptionId);
    }
  }, [currentSubscription]);

  return (
    <Fragment>
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
        {/* <TextField
          required
          errorMessage={errorPassword}
          label={formatMessage('Password')}
          placeholder={formatMessage('Password to assess resources')}
          value={password}
          onChange={updatePassword}
        /> */}
        <Dropdown
          required
          label={formatMessage('Locations')}
          options={deployLocationsOption}
          placeholder={formatMessage('Select your location')}
          onChange={updateCurrentLocation}
        />
        <Dropdown
          multiSelect
          label="Add more external resources"
          options={extenstionResourceOptions}
          placeholder="Select options"
          selectedKeys={selectedResources}
          onChange={onSelectedResource}
        />
      </form>
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
              externalResources: selectedResources,
            });
          }}
        />
      </DialogFooter>
    </Fragment>
  );
};
