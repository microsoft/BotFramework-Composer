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
export const CreateNewResource: React.FC<CreateNewResourceProps> = (props) => {
  const { state, actions } = useContext(StoreContext);
  const { subscriptions, resourceGroups, deployLocations } = state;
  const [currentSubscription, setSubscription] = useState<Subscription>();
  const [currentResourceGroup, setResourceGroup] = useState('');
  const [errorMessage, setErrorMsg] = useState('');
  const [currentLocation, setLocation] = useState<DeployLocation>();

  const subscriptionOption = useMemo(() => {
    return subscriptions.map((t) => ({ key: t.subscriptionId, text: t.displayName }));
  }, [subscriptions]);

  const resourceGroupsOption = useMemo(() => {
    return resourceGroups.map((t) => ({ key: t.id, text: t.name }));
  }, [resourceGroups]);

  const deployLocationsOption = useMemo(() => {
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

  const updateCurrentResoruceGroup = useMemo(
    () => (_e, option?: IDropdownOption) => {
      const group = resourceGroups.find((t) => t.id === option?.key);

      if (group) {
        setResourceGroup(group.name);
      }
    },
    [resourceGroups]
  );

  const newResourceGroup = useMemo(
    () => (e, newName) => {
      // validate existed or not
      const existed = resourceGroups.find((t) => t.name === newName);
      if (existed) {
        setErrorMsg('this resource group already exist');
      } else {
        setErrorMsg('');
        setResourceGroup(newName);
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
      actions.getResourceGroups(currentSubscription.subscriptionId);
      actions.getDeployLocations(currentSubscription.subscriptionId);
    }
  }, [currentSubscription]);

  return (
    <Fragment>
      <form>
        <Dropdown
          label={formatMessage('Subscription')}
          options={subscriptionOption}
          placeholder={formatMessage('Select your subscription')}
          onChange={updateCurrentSubscription}
        />
        <TextField
          errorMessage={errorMessage}
          label={formatMessage('Name')}
          placeholder={formatMessage('Name of your new resource group')}
          onChange={newResourceGroup}
        />
        <TextField
          errorMessage={errorMessage}
          label={formatMessage('Password')}
          placeholder={formatMessage('Password to assess resources')}
          onChange={newResourceGroup}
        />
        <Dropdown
          label={formatMessage('Locations')}
          options={deployLocationsOption}
          placeholder={formatMessage('Select your location')}
          onChange={updateCurrentLocation}
        />
        <Dropdown
          label={formatMessage('Resource group')}
          options={resourceGroupsOption}
          placeholder={formatMessage('Select your resource group')}
          onChange={updateCurrentResoruceGroup}
        />
      </form>
      <DialogFooter>
        <DefaultButton text={formatMessage('Cancel')} onClick={props.onDismiss} />
        <PrimaryButton
          disabled={!currentSubscription || !currentResourceGroup || errorMessage !== ''}
          text={formatMessage('Ok')}
          onClick={async () => {
            await props.onSubmit({
              subscription: currentSubscription,
              resourceGroup: currentResourceGroup,
              location: currentLocation,
            });
          }}
        />
      </DialogFooter>
    </Fragment>
  );
};
