// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import * as formatMessage from 'format-message';
import * as React from 'react';
import { useState, useMemo, useEffect, Fragment } from 'react';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import {
  currentProjectId,
  getAccessTokensFromStorage,
  setProvisionConfig,
  getProvisionConfig,
  currentPage,
} from '@bfc/extension-client';
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
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';

import { getResourceList, getSubscriptions, getResourceGroups, getDeployLocations, getPreview } from './api';

initializeIcons(undefined, { disableWarnings: true });

const resourceTypes = ['Azure Web App', 'Cognitive Services'];
const publishType = 'azurePublish';
const choiceOptions: IChoiceGroupOption[] = [
  { key: 'create', text: 'Create new Azure resources' },
  { key: 'import', text: 'Import existing Azure resources' },
];

const PageTypes = {
  ConfigProvision: 'config',
  ReviewResource: 'review',
};

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

  // value for create resources
  const [choice, setChoice] = useState(choiceOptions[0]);
  const [currentSubscription, setSubscription] = useState<Subscription>();
  const [currentHostName, setHostName] = useState('');
  const [errorHostName, setErrorHostName] = useState('');
  const [currentLocation, setLocation] = useState<DeployLocation>();
  const [extensionResourceOptions, setExtensionResourceOptions] = useState<any[]>([]);
  const [enabledResources, setEnabledResources] = useState({});

  // value for import provision setting
  const [isEditorError, setEditorError] = useState(false);
  const [importConfig, setImportConfig] = useState();

  const [page, setPage] = useState(PageTypes.ConfigProvision);
  const [group, setGroup] = useState<IGroup[]>();
  const [listItems, setListItem] = useState();

  const columns: IColumn[] = [
    {
      key: 'icon',
      name: 'File Type',
      iconName: 'Page',
      isIconOnly: true,
      fieldName: 'name',
      minWidth: 16,
      maxWidth: 16,
      onRender: (item: any) => {
        return <img src={item.icon} />;
      },
    },
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

  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     console.log(currentPage());
  //     setPage(currentPage());
  //   }, 1000);
  //   return () => clearInterval(timer);
  // }, []);

  useEffect(() => {
    const { access_token } = getAccessTokensFromStorage();
    setToken(access_token);
    getSubscriptions(access_token).then(setSubscriptions);
    getResources();
    // it only run once
    console.log(currentPage());
    setPage(currentPage());
  }, []);

  const getResources = async () => {
    const resources = await getResourceList(currentProjectId(), publishType).catch((err) => {
      // todo: how do we handle API errors in this component
      console.log('ERROR', err);
    });
    setExtensionResourceOptions(resources);

    // set all of the resources to enabled by default.
    // in the future we may allow users to toggle some of them on and off
    const enabled = {};
    resources.forEach((resourceType) => {
      enabled[resourceType.key] = {
        enabled: true,
      };
    });
    setEnabledResources(enabled);
  };

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
        // update all the config to client
        setProvisionConfig({
          subscription: sub,
          hostname: currentHostName,
          location: currentLocation,
          externalResources: extensionResourceOptions,
        });
      }
    },
    [subscriptions, currentHostName, currentLocation, extensionResourceOptions]
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
        setProvisionConfig({
          subscription: currentSubscription,
          hostname: newName,
          location: currentLocation,
          externalResources: extensionResourceOptions,
        });
      }
    },
    [resourceGroups, currentSubscription, currentLocation, extensionResourceOptions]
  );

  const updateCurrentLocation = useMemo(
    () => (_e, option?: IDropdownOption) => {
      const location = deployLocations.find((t) => t.id === option?.key);

      if (location) {
        setLocation(location);
        setProvisionConfig({
          subscription: currentSubscription,
          hostname: currentHostName,
          location: location,
          externalResources: extensionResourceOptions,
        });
      }
    },
    [deployLocations, currentSubscription, currentHostName, extensionResourceOptions]
  );

  useEffect(() => {
    if (currentSubscription) {
      // get resource group under subscription
      getResourceGroups(token, currentSubscription.subscriptionId).then(setResourceGroups);
      getDeployLocations(token, currentSubscription.subscriptionId).then(setDeployLocations);
    }
  }, [currentSubscription]);

  const updateChoice = useMemo(
    () => (ev, option) => {
      setChoice(option);
    },
    []
  );

  return page === PageTypes.ConfigProvision ? (
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
      {choice.key === 'create' && !subscriptionOption ? <Spinner label="Loading" /> : null}
      {choice.key === 'import' && (
        <div style={{ width: '60%' }}>
          <div>Publish Configuration</div>
          <JsonEditor
            id={publishType}
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
        </div>
      )}

      {/* <DialogFooter>
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
                type: publishType,
                externalResources: extensionResourceOptions,
              });
            }}
          />
        ) : (
          <PrimaryButton disabled={isEditorError} text="Save" onClick={onSave} />
        )}
      </DialogFooter> */}
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
      {/* <DialogFooter>
        <DefaultButton text={'Cancel'} onClick={closeDialog} />
        <PrimaryButton
          disabled={!currentSubscription || !currentHostName || errorHostName !== ''}
          text={'Ok'}
          onClick={async () => {
            await onSubmit({
              subscription: currentSubscription,
              hostname: currentHostName,
              location: currentLocation,
              type: publishType,
              externalResources: extensionResourceOptions,
            });
          }}
        />
      </DialogFooter> */}
    </Fragment>
  );
};
