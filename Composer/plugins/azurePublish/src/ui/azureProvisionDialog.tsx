// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import * as formatMessage from 'format-message';
import * as React from 'react';
import { useState, useMemo, useEffect, Fragment } from 'react';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { getAccessTokensFromStorage, startProvision, closeDialog, setPublishConfig } from '@bfc/extension-client';
import { Subscription } from '@azure/arm-subscriptions/esm/models';
import { ResourceGroup } from '@azure/arm-resources/esm/models';
import { DeployLocation } from '@bfc/types';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import {
  DetailsList,
  DetailsListLayoutMode,
  IColumn,
  IGroup,
  CheckboxVisibility,
} from 'office-ui-fabric-react/lib/DetailsList';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { JsonEditor } from '@bfc/code-editor';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';

import { getSubscriptions, getResourceGroups, getDeployLocations, getPreview } from './api';

const extensionResourceOptions = [
  {
    key: 'appRegistration',
    text: 'Microsoft Application Registration',
    description: 'Required registration allowing your bot to communicate with Azure services',
  },
  { key: 'webApp', text: 'Azure Web App', description: 'Hosting for your bot' },
  { key: 'botRegistration', text: 'Azure Bot Service', description: 'Register your bot with the Azure Bot Service' },
  { key: 'luisAuthoring', text: 'Luis Authoring Resource', description: 'Author LUIS applications' },
  { key: 'luisPrediction', text: 'Luis Prediction Resource', description: 'Use LUIS in your bot' },
  // { key: 'blobStorage', text: 'BlobStorage', description: 'Capture transcripts into Blob Storage' },
  // { key: 'cosmoDb', text: 'CosmoDb', description: 'Use CosmoDB to store your bot state' },
  // {
  //   key: 'applicationInsights',
  //   text: 'application Insights',
  //   description: 'Track the performance of your app with app insights',
  // },
];
const resourceTypes = ['Azure Web App', 'Cognitive Services'];

const choiceOptions: IChoiceGroupOption[] = [
  { key: 'create', text: 'Create new Azure resources' },
  { key: 'import', text: 'Import existing Azure resources' },
];

function onRenderDetailsHeader(props, defaultRender) {
  return (
    <Sticky isScrollSynced stickyPosition={StickyPositionType.Header}>
      {defaultRender({
        ...props,
        onRenderColumnHeaderTooltip: (tooltipHostProps) => <TooltipHost {...tooltipHostProps} />,
      })}
    </Sticky>
  );
}

export const AzureProvisionDialog: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [resourceGroups, setResourceGroups] = useState<ResourceGroup[]>([]);
  const [deployLocations, setDeployLocations] = useState<DeployLocation[]>([]);

  const [token, setToken] = useState<string>();
  const [graphToken, setGraphToken] = useState<string>();

  const [choice, setChoice] = useState(choiceOptions[0]);
  const [currentSubscription, setSubscription] = useState<Subscription>();
  const [currentHostName, setHostName] = useState('');
  const [errorHostName, setErrorHostName] = useState('');
  const [currentLocation, setLocation] = useState<DeployLocation>();
  // const [selectedResources, setExternalResources] = useState<string[]>([]);
  const [enabledResources, setEnabledResources] = useState({});

  const [isEditorError, setEditorError] = useState(false);
  const [importConfig, setImportConfig] = useState();
  const [page, setPage] = useState(1);
  const [group, setGroup] = useState<IGroup[]>();
  const [listItems, setListItem] = useState();

  const columns: IColumn[] = [
    {
      key: 'Name',
      name: formatMessage('Name'),
      className: 'name',
      fieldName: 'name',
      minWidth: 70,
      isRowHeader: true,
      isResizable: true,
      data: 'string',
      onRender: (item: any) => {
        return <span>{item.name}</span>;
      },
      isPadded: true,
    },
    {
      key: 'Type',
      name: formatMessage('Type'),
      className: 'type',
      fieldName: 'type',
      minWidth: 70,
      isRowHeader: true,
      isResizable: true,
      data: 'string',
      onRender: (item: any) => {
        return <span>{item.text}</span>;
      },
      isPadded: true,
    },
    {
      key: 'Tier',
      name: formatMessage('Tier'),
      className: 'tier',
      fieldName: 'tier',
      minWidth: 70,
      isRowHeader: true,
      isResizable: true,
      data: 'string',
      onRender: (item: any) => {
        return <span>{item.tier}</span>;
      },
      isPadded: true,
    },
  ];

  useEffect(() => {
    // Load the list of subscriptions for the dropdown....
    const enabled = {};
    extensionResourceOptions.forEach((resourceType) => {
      enabled[resourceType.key] = {
        enabled: true,
      };
    });
    setEnabledResources(enabled);

    const { access_token, graph_token } = getAccessTokensFromStorage();
    console.log('RECEIVED ACCeSS TOKENS FROM STORAGE', access_token, graph_token);
    setToken(access_token);
    setGraphToken(graph_token);
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

  const onNext = useMemo(
    () => (config) => {
      const result = getPreview(config.hostname);
      console.log(enabledResources);
      let items = [] as any;
      const groups: IGroup[] = [];
      let startIndex = 0;
      for (const type of resourceTypes) {
        const resources = result.filter((item) => enabledResources[item.key] && item.group === type);

        groups.push({
          key: type,
          name: type,
          startIndex: startIndex,
          count: resources.length,
        });
        startIndex = startIndex + resources.length;
        items = items.concat(resources);
      }
      setGroup(groups);
      setListItem(items);
      setPage(2);
    },
    [enabledResources]
  );

  const onSubmit = useMemo(
    () => async (options) => {
      console.log(options);
      // call back to the main Composer API to begin this process...
      startProvision(options);
      // TODO: close window
      closeDialog();
    },
    []
  );

  const onSave = useMemo(
    () => () => {
      console.log(importConfig);
      setPublishConfig(importConfig);
      closeDialog();
    },
    []
  );

  const updateChoice = useMemo(
    () => (ev, option) => {
      setChoice(option);
    },
    []
  );

  return page === 1 ? (
    <Fragment>
      <ChoiceGroup defaultSelectedKey="create" options={choiceOptions} onChange={updateChoice} />
      {subscriptionOption?.length && choice.key === 'create' && (
        <form style={{ width: '60%' }}>
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
        </form>
      )}
      {choice.key === 'create' && (!subscriptionOption || !subscriptionOption.length) && <Spinner label="Loading" />}
      {choice.key === 'import' && (
        <Fragment>
          <div>Publish Configuration</div>
          <JsonEditor
            id="azurePublish"
            height={200}
            styles={{ width: '60%' }}
            value={importConfig}
            onChange={(value) => {
              setEditorError(false);
              setImportConfig(value);
            }}
            onError={() => {
              setEditorError(true);
            }}
          />
        </Fragment>
      )}

      <DialogFooter>
        <DefaultButton text={'Cancel'} onClick={closeDialog} />
        {choice.key === 'create' ? (
          <PrimaryButton
            disabled={!currentSubscription || !currentHostName || errorHostName !== ''}
            text="Next"
            onClick={() => {
              onNext({
                subscription: currentSubscription,
                hostname: currentHostName,
                location: currentLocation,
                type: 'azurePublish', // todo: this should be dynamic
                externalResources: extensionResourceOptions,
              });
            }}
          />
        ) : (
          <PrimaryButton disabled={isEditorError} text="Save" onClick={onSave} />
        )}
      </DialogFooter>
    </Fragment>
  ) : (
    <Fragment>
      <DetailsList
        isHeaderVisible
        checkboxVisibility={CheckboxVisibility.hidden}
        columns={columns}
        getKey={(item) => item.key}
        groups={group}
        items={listItems}
        layoutMode={DetailsListLayoutMode.justified}
        setKey="none"
        onRenderDetailsHeader={onRenderDetailsHeader}
      />
      <DialogFooter>
        <DefaultButton text={'Cancel'} onClick={closeDialog} />
        <PrimaryButton
          disabled={!currentSubscription || !currentHostName || errorHostName !== ''}
          text={'Ok'}
          onClick={async () => {
            await onSubmit({
              subscription: currentSubscription,
              hostname: currentHostName,
              location: currentLocation,
              type: 'azurePublish', // todo: this should be dynamic
              externalResources: extensionResourceOptions,
            });
          }}
        />
      </DialogFooter>
    </Fragment>
  );
};
