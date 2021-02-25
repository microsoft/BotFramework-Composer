// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import formatMessage from 'format-message';
import * as React from 'react';
import { useState, useMemo, useEffect, Fragment } from 'react';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { getAccessToken, logOut, usePublishApi } from '@bfc/extension-client';
import { Subscription } from '@azure/arm-subscriptions/esm/models';
import { ResourceGroup } from '@azure/arm-resources/esm/models';
import { DeployLocation } from '@botframework-composer/types';
import { NeutralColors } from '@uifabric/fluent-theme';
import {
  ScrollablePane,
  ScrollbarVisibility,
  ChoiceGroup,
  IChoiceGroupOption,
  DetailsList,
  DetailsListLayoutMode,
  IColumn,
  IGroup,
  CheckboxVisibility,
  TooltipHost,
  Icon,
  TextField,
  Spinner,
  Persona,
  IPersonaProps,
  PersonaSize,
  Selection,
  SelectionMode,
} from 'office-ui-fabric-react';
import { SharedColors } from '@uifabric/fluent-theme';
import { JsonEditor } from '@bfc/code-editor';
import jwtDecode from 'jwt-decode';

import { AzureResourceTypes, ResourcesItem, authConfig } from '../types';

import {
  getResourceList,
  getSubscriptions,
  getResourceGroups,
  getDeployLocations,
  getPreview,
  getLuisAuthoringRegions,
  CheckWebAppNameAvailability,
} from './api';

const choiceOptions: IChoiceGroupOption[] = [
  { key: 'create', text: 'Create new Azure resources' },
  { key: 'import', text: 'Import existing Azure resources' },
];
const PageTypes = {
  ConfigProvision: 'config',
  AddResources: 'add',
  ReviewResource: 'review',
};
const DialogTitle = {
  CONFIG_RESOURCES: {
    title: formatMessage('Configure resources'),
    subText: formatMessage('How you would like to provision your Azure resources to publish your bot?'),
  },
  ADD_RESOURCES: {
    title: formatMessage('Add resources'),
    subText: formatMessage('Your bot needs the following resources based on its capabilities. Select resources that you want to provision in your publishing profile.')
  },
  REVIEW: {
    title: formatMessage('Review & create'),
    subText: formatMessage(
      'Please review the resources that will be created for your bot. Once these resources are provisioned, they will be available in your Azure portal.'
    ),
  },
};

function decodeToken(token: string) {
  try {
    return jwtDecode<any>(token);
  } catch (err) {
    console.error('decode token error in ', err);
    return null;
  }
}

function removePlaceholder(config:any){
  try{
    if(config){
      let str = JSON.stringify(config);
      str = str.replace(/<[^>]*>/g, '');
      const newConfig = JSON.parse(str);
      return newConfig;
    } else {
      return undefined;
    }
  }catch(e){
    console.error(e);
  }
};

function getExistResources (config){
  const result = [];
  if(config){
    // If name or hostname is configured, it means the webapp is already created.
    if(config.hostname || config.name){
      result.push(AzureResourceTypes.WEBAPP);
    }
    if(config.settings?.MicrosoftAppId){
      result.push(AzureResourceTypes.BOT_REGISTRATION);
      result.push(AzureResourceTypes.APP_REGISTRATION);
    }
    if(config.settings?.luis?.authoringKey){
      result.push(AzureResourceTypes.LUIS_AUTHORING);
    }
    if(config.settings?.luis?.endpointKey){
      result.push(AzureResourceTypes.LUIS_PREDICTION);
    }
    if(config.settings?.qna?.subscriptionKey){
      result.push(AzureResourceTypes.QNA);
    }
    if(config.settings?.applicationInsights?.InstrumentationKey){
      result.push(AzureResourceTypes.APPINSIGHTS);
    }
    if(config.settings?.cosmosDb?.authKey){
      result.push(AzureResourceTypes.COSMOSDB);
    }
    if(config.settings?.blobStorage?.connectionString){
      result.push(AzureResourceTypes.BLOBSTORAGE);
    }
    console.log(result);
    return result;
  } else return [];
}

const iconStyle = (required) => {
  return {
    root: {
      selectors: {
        '&::before': {
          content: required ? " '*'" : '',
          color: SharedColors.red10,
          paddingRight: 3,
        },
      },
    },
  };
};

const onRenderLabel = (props) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        marginBottom: '5px',
      }}
    >
      <div
        style={{
          marginRight: '5px',
          fontWeight: 600,
          fontSize: '14px',
        }}
      >
        {' '}
        {props.label}{' '}
      </div>
      <TooltipHost content={props.ariaLabel}>
        <Icon iconName="Info" styles={iconStyle(props.required)} />
      </TooltipHost>
    </div>
  );
};

const columns: IColumn[] = [
  {
    key: 'Icon',
    name: 'File Type',
    isIconOnly: true,
    fieldName: 'name',
    minWidth: 16,
    maxWidth: 16,
    onRender: (item: ResourcesItem & {name,icon}) => {
      return <img src={item.icon} />;
    },
  },
  {
    key: 'Name',
    name: formatMessage('Name'),
    className: 'name',
    fieldName: 'name',
    minWidth: 300,
    isRowHeader: true,
    data: 'string',
    onRender: (item: ResourcesItem & {name,icon}) => {
      return <div style={{whiteSpace: 'normal'}}>
          <div style={{fontSize: '14px', color: NeutralColors.gray190}}>{item.text}</div>
          <div style={{fontSize: '12px', color: NeutralColors.gray130}}>{item.tier}</div>
        </div>;
    },
    isPadded: true,
  },
  {
    key: 'Description',
    name: formatMessage('Description'),
    className: 'description',
    fieldName: 'description',
    minWidth: 380,
    isRowHeader: true,
    data: 'string',
    onRender: (item: ResourcesItem & {name,icon}) => {
      return <div style={{whiteSpace: 'normal', fontSize:'12px', color: NeutralColors.gray130}}>{item.description}</div>;
    },
    isPadded: true,
  }
];

const reviewCols: IColumn[] = [
  {
    key: 'Icon',
    name: 'File Type',
    isIconOnly: true,
    fieldName: 'name',
    minWidth: 16,
    maxWidth: 16,
    onRender: (item: ResourcesItem & {name,icon}) => {
      return <img src={item.icon} />;
    },
  },
  {
    key: 'Resource Type',
    name: formatMessage('Resource Type'),
    className: 'Resource Type',
    fieldName: 'Resource Type',
    minWidth: 150,
    isRowHeader: true,
    data: 'string',
    onRender: (item: ResourcesItem) => {
      return <div>{item.text}</div>;
    },
    isPadded: true,
  },
  {
    key: 'resourceGroup',
    name: formatMessage('Resource Group'),
    className: 'resourceGroup',
    fieldName: 'resourceGroup',
    minWidth: 100,
    isRowHeader: true,
    data: 'string',
    onRender: (item: ResourcesItem) => {
    return <div style={{whiteSpace: 'normal', fontSize:'12px', color: NeutralColors.gray130}}>{item.resourceGroup}</div>;
    },
    isPadded: true,
  },
  {
    key: 'Name',
    name: formatMessage('Name'),
    className: 'name',
    fieldName: 'name',
    minWidth: 150,
    isRowHeader: true,
    data: 'string',
    onRender: (item: ResourcesItem & {name,icon}) => {
      return <div style={{whiteSpace: 'normal', fontSize:'12px', color: NeutralColors.gray130}}>{item.name}</div>;
    },
    isPadded: true,
  },
  {
    key: 'Region',
    name: formatMessage('Region'),
    className: 'region',
    fieldName: 'region',
    minWidth: 100,
    isRowHeader: true,
    data: 'string',
    onRender: (item: ResourcesItem & {name,icon}) => {
      return <div style={{whiteSpace: 'normal', fontSize:'12px', color: NeutralColors.gray130}}>{item.region?.displayName}</div>;
    },
    isPadded: true,
  },
];

export const AzureProvisionDialog: React.FC = () => {
  const {
    currentProjectId,
    publishConfig,
    startProvision,
    closeDialog,
    onBack,
    savePublishConfig,
    setTitle,
    getSchema,
    getType,
    getTokenFromCache,
    isGetTokenFromUser,
  } = usePublishApi();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [deployLocations, setDeployLocations] = useState<DeployLocation[]>([]);
  const [luisLocations, setLuisLocations] = useState<DeployLocation[]>([]);

  const [token, setToken] = useState<string>();
  const [currentUser, setCurrentUser] = useState<any>();

  const [choice, setChoice] = useState(choiceOptions[0]);
  const [currentSubscription, setSubscription] = useState<string>('');
  const [currentResourceGroup, setResourceGroup] = useState<string>('');
  const [currentHostName, setHostName] = useState('');
  const [errorHostName, setErrorHostName] = useState('');
  const [currentLocation, setLocation] = useState<DeployLocation>();
  const [currentLuisLocation, setCurrentLuisLocation] = useState<DeployLocation>();
  const [extensionResourceOptions, setExtensionResourceOptions] = useState<ResourcesItem[]>([]);
  const [enabledResources, setEnabledResources] = useState<ResourcesItem[]>([]); // create from optional list
  const [requireResources, setRequireResources] = useState<ResourcesItem[]>([]);

  const [isEditorError, setEditorError] = useState(false);
  const [importConfig, setImportConfig] = useState<any>();

  const [page, setPage] = useState(PageTypes.ConfigProvision);
  const [group, setGroup] = useState<IGroup[]>();
  const [listItems, setListItem] = useState<(ResourcesItem & {name,icon})[]>();
  const [reviewListItems, setReviewListItems] = useState<ResourcesItem[]>([]);

  // set type of publish - azurePublish or azureFunctionsPublish
  const publishType = getType();
  const currentConfig = removePlaceholder(publishConfig);

  useEffect(() => {
    setTitle(DialogTitle.CONFIG_RESOURCES);
    if (isGetTokenFromUser()) {
      const { accessToken } = getTokenFromCache();

      setToken(accessToken);
      // decode token
      const decoded = decodeToken(accessToken);
      if (decoded) {
        setCurrentUser({
          token: accessToken,
          email: decoded.upn,
          name: decoded.name,
          expiration: (decoded.exp || 0) * 1000, // convert to ms,
          sessionExpired: false,
        });
      }
    } else {
      getAccessToken(authConfig.arm).then((token) => {
        setToken(token);
        // decode token
        const decoded = decodeToken(token);
        if (decoded) {
          setCurrentUser({
            token: token,
            email: decoded.upn,
            name: decoded.name,
            expiration: (decoded.exp || 0) * 1000, // convert to ms,
            sessionExpired: false,
          });
        }
      });
    }
  }, []);

  useEffect(()=>{
    if(currentConfig){
      if(currentConfig?.subscriptionId){
        setSubscription(currentConfig?.subscriptionId);
      }
      if(currentConfig?.resourceGroup){
        setResourceGroup(currentConfig?.resourceGroup);
      }
      if(currentConfig?.hostname){
        setHostName(currentConfig?.hostname);
      } else if(currentConfig?.name){
        setHostName(currentConfig?.environment? `${currentConfig?.name}-${currentConfig?.environment}`: currentConfig?.name);
      }
    }
  },[currentConfig]);

  useEffect(()=> {
    if(token){
      getSubscriptions(token).then(setSubscriptions);
      getResources();
    }
  }, [token]);

  const getResources = async () => {
    try {
      const resources = await getResourceList(currentProjectId(), publishType);
      setExtensionResourceOptions(resources);
    } catch (err) {
      // todo: how do we handle API errors in this component
      console.log('ERROR', err);
    }
  };

  const subscriptionOption = useMemo(() => {
    return subscriptions.map((t) => ({ key: t.subscriptionId, text: t.displayName }));
  }, [subscriptions]);

  const deployLocationsOption = useMemo((): IDropdownOption[] => {
    return deployLocations.map((t) => ({ key: t.id, text: t.displayName }));
  }, [deployLocations]);

  const luisLocationsOption = useMemo((): IDropdownOption[] => {
    return luisLocations.map((t) => ({ key: t.id, text: t.displayName }));
  }, [luisLocations]);

  const updateCurrentSubscription = useMemo(
    () => (_e, option?: IDropdownOption) => {
      const sub = subscriptionOption.find((t) => t.key === option?.key);

      if (sub) {
        setSubscription(sub.key);
      }
    },
    [subscriptionOption]
  );

  const checkNameAvailability = useMemo(()=>(newName: string)=>{
    setErrorHostName('');
    console.log(publishType);
    if(currentSubscription && publishType === 'azurePublish'){
      // check app name whether exist or not
      CheckWebAppNameAvailability(token, newName, currentSubscription).then(value=>{
        if(!value.nameAvailable){
          setErrorHostName(value.message);
        }
      });
    }
  }, [publishType, currentSubscription, token]);

  const updateCurrentResourceGroup = useMemo(()=>(e,newGroup)=>{
    setResourceGroup(newGroup);
  },[]);

  const newHostName = useMemo(
    () => (e, newName) => {
      setHostName(newName);
      checkNameAvailability(newName);
    },
    [checkNameAvailability]
  );

  const updateCurrentLocation = useMemo(
    () => (_e, option?: IDropdownOption) => {
      const location = deployLocations.find((t) => t.id === option?.key);

      if (location) {
        setLocation(location);
        const region = luisLocations.find(item=> item.name === location.name)
        if(region){
          setCurrentLuisLocation(region);
        } else {
          setCurrentLuisLocation(luisLocations[0]);
        }
      }
    },
    [deployLocations, luisLocations]
  );

  const updateLuisLocation = useMemo(
    () => (_e, option?: IDropdownOption) => {
      const location = luisLocations.find((t) => t.id === option?.key);
      if (location) {
        setCurrentLuisLocation(location);
      }
    },
    [luisLocations]
  );

  useEffect(() => {
    if (currentSubscription && token) {
      // get resource group under subscription
      getDeployLocations(token, currentSubscription).then((data:DeployLocation[])=> {
        setDeployLocations(data);
        const luRegions = getLuisAuthoringRegions();
        const region = data.filter(item=> luRegions.includes(item.name));
        setLuisLocations(region);
      });
    }
  }, [currentSubscription, token]);

  const onNext = useMemo(
    () => (hostname) => {
      // get resources already have
      const alreadyHave = getExistResources(currentConfig);

      const names = getPreview(hostname);
      const result = [];
      for(let resource of extensionResourceOptions){
        if(alreadyHave.find(item => item === resource.key)){
          continue;
        }
        const previewObject = names.find((n) => n.key === resource.key);
        result.push({
          ...resource,
          name: previewObject ? previewObject.name : `UNKNOWN NAME FOR ${resource.key}`,
          icon: previewObject ? previewObject.icon : undefined,
        });
      }

      // set review list
      const groups: IGroup[] = [];
      const requireList = result.filter((item) => item.required);
      setRequireResources(requireList);
      const externalList = result.filter((item) => !item.required);
      groups.push({
        key: 'required',
        name: 'Required',
        startIndex: 0,
        count: requireList.length,
      });
      groups.push({
        key: 'optional',
        name: 'Optional',
        startIndex: requireList.length,
        count: externalList.length,
      });
      const items = requireList.concat(externalList);

      setGroup(groups);
      setListItem(items);

      setPage(PageTypes.AddResources);
      setTitle(DialogTitle.ADD_RESOURCES);
    },
    [extensionResourceOptions]
  );

  const onSubmit = useMemo(
    () => async (options) => {
      // call back to the main Composer API to begin this process...
      startProvision(options);
      closeDialog();
    },
    []
  );

  const onSave = useMemo(
    () => () => {
      savePublishConfig(importConfig);
      closeDialog();
    },
    [importConfig]
  );

  const updateChoice = useMemo(
    () => (ev, option) => {
      setChoice(option);
    },
    []
  );

  const onRenderSecondaryText = useMemo(
    () => (props: IPersonaProps) => {
      return (
        <div
          style={{ color: 'blue', cursor: 'pointer' }}
          onClick={() => {
            closeDialog();
            logOut();
          }}
        >
          {props.secondaryText}
        </div>
      );
    },
    []
  );

  const isDisAble = useMemo(() => {
    return !currentSubscription || !currentHostName || errorHostName !== '' || !currentLocation;
  }, [currentSubscription, currentHostName, errorHostName, currentLocation]);

  const PageFormConfig = (
    <Fragment>
      <ChoiceGroup defaultSelectedKey="create" options={choiceOptions} style={{}} onChange={updateChoice} />
      {subscriptionOption?.length > 0 && choice.key === 'create' && (
        <form style={{ width: '50%', marginTop: '16px' }}>
          <Dropdown
            required
            disabled={currentConfig?.subscriptionId}
            defaultSelectedKey={currentSubscription}
            ariaLabel={formatMessage('All resources in an Azure subscription are billed together')}
            label={formatMessage('Subscription')}
            options={subscriptionOption}
            placeholder={'Select one'}
            styles={{ root: { paddingBottom: '8px' } }}
            onChange={updateCurrentSubscription}
            onRenderLabel={onRenderLabel}
          />
          <TextField
            required
            disabled={currentConfig?.resourceGroup}
            defaultValue={currentResourceGroup}
            label={formatMessage('Resource group name')}
            placeholder={'Name of your new resource group'}
            onChange={updateCurrentResourceGroup}
            styles={{ root: { paddingBottom: '8px' } }}
            onRenderLabel={onRenderLabel}
            ariaLabel={formatMessage(
              'A resource group is a collection of resources that share the same lifecycle, permissions, and policies'
            )}
          />
          <TextField
            required
            disabled={currentConfig?.hostname || currentConfig?.name}
            defaultValue={currentHostName}
            errorMessage={errorHostName}
            label={formatMessage('Hostname')}
            ariaLabel={formatMessage('A hostname which is used to make up the provisoned services names')}
            placeholder={'Name of your services'}
            onChange={newHostName}
            styles={{ root: { paddingBottom: '8px' } }}
            onRenderLabel={onRenderLabel}
          />
          <Dropdown
            required
            defaultSelectedKey={currentLocation?.id}
            label={'Region'}
            options={deployLocationsOption}
            placeholder={'Select one'}
            styles={{ root: { paddingBottom: '8px' } }}
            onChange={updateCurrentLocation}
          />
          {currentLocation && currentLuisLocation && currentLocation.name !== currentLuisLocation.name &&
          <Dropdown
            required
            label={'Region for Luis'}
            defaultSelectedKey={currentLuisLocation.id}
            options={luisLocationsOption}
            placeholder={'Select one'}
            onChange={updateLuisLocation}
          />}
        </form>
      )}
      {choice.key === 'create' && subscriptionOption.length < 1 && <Spinner label="Loading" />}
      {choice.key === 'import' && (
        <div style={{ width: '50%', marginTop: '10px', height: '100%' }}>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#323130',
              padding: '5px 0px',
            }}
          >
            {formatMessage('Publish Configuration')}
          </div>
          <JsonEditor
            height={300}
            value={currentConfig || importConfig}
            id={publishType}
            schema={getSchema()}
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
    </Fragment>
  );

  const selection = useMemo(() => {
    const s = new Selection({
      onSelectionChanged: () => {
        const list = s.getSelection();
        setEnabledResources(list);
      },
      canSelectItem: (item, index) => {
        return item.required === false;
      },
    });
    if (s && listItems) {
      s.setItems(listItems, false);
      s.setAllSelected(true);
    }
    return s;
  }, [listItems]);

  const PageAddResources = useMemo(() => {
    return (
      <Fragment>
        <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto} style={{ height: 'calc(100vh - 64px)' }}>
          <DetailsList
            isHeaderVisible
            checkboxVisibility={CheckboxVisibility.onHover}
            columns={columns}
            getKey={(item) => item.key}
            groups={group}
            items={listItems}
            layoutMode={DetailsListLayoutMode.justified}
            selection={selection}
            selectionMode={SelectionMode.multiple}
            setKey="none"
          />
        </ScrollablePane>
      </Fragment>
    );
  }, [group, listItems, selection]);


  const PageReview = (
    <Fragment>
      <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto} style={{height: 'calc(100vh - 64px)'}}>
        <DetailsList
          isHeaderVisible
          selectionMode={SelectionMode.none}
          columns={reviewCols}
          getKey={(item) => item.key}
          items={reviewListItems}
          layoutMode={DetailsListLayoutMode.justified}
          setKey="none"
        />
      </ScrollablePane>
    </Fragment>
  );

  const PageFooter = useMemo(() => {
    if (page === PageTypes.ConfigProvision) {
      return (
        <div style={{ display: 'flex', flexFlow: 'row nowrap', justifyContent: 'space-between' }}>
          {currentUser ? (
            <Persona
              secondaryText={'Sign out'}
              size={PersonaSize.size40}
              text={currentUser.name}
              onRenderSecondaryText={onRenderSecondaryText}
            />
          ) : null}
          <div>
            <DefaultButton style={{ margin: '0 4px' }} text={'Back'} onClick={onBack} />
            {choice.key === 'create' ? (
              <PrimaryButton
                disabled={isDisAble}
                style={{ margin: '0 4px' }}
                text="Next: Review"
                onClick={() => {
                  onNext(currentHostName);
                }}
              />
            ) : (
              <PrimaryButton disabled={isEditorError} style={{ margin: '0 4px' }} text="Save" onClick={onSave} />
            )}
          </div>
        </div>
      );
    } else if(page === PageTypes.AddResources){
      return (
        <div style={{ display: 'flex', flexFlow: 'row nowrap', justifyContent: 'space-between' }}>
          {currentUser ? (
            <Persona
              secondaryText={'Sign out'}
              size={PersonaSize.size40}
              text={currentUser.name}
              onRenderSecondaryText={onRenderSecondaryText}
            />
          ) : null}
          <div>
            <DefaultButton
              style={{ margin: '0 4px' }}
              text={'Back'}
              onClick={() => {
                setPage(PageTypes.ConfigProvision);
                setTitle(DialogTitle.CONFIG_RESOURCES);
              }}
            />
            <PrimaryButton
              text={'Next'}
              onClick={()=>{
                setPage(PageTypes.ReviewResource);
                setTitle(DialogTitle.REVIEW);
                let selectedResources = requireResources.concat(enabledResources);
                selectedResources = selectedResources.map(item=>{
                  let region = currentLocation;
                  if(item.key.includes('luis')){
                    region = currentLuisLocation;
                  }
                  return {...item, region: region, resourceGroup: currentConfig?.resourceGroup || currentResourceGroup};
                });
                setReviewListItems(selectedResources);
              }}
              style={{margin: '0 4px'}}
            />
          </div>
        </div>
      );
    } else {
      return (
        <div style={{display: 'flex', flexFlow: 'row nowrap', justifyContent: 'space-between'}}>
          {currentUser? <Persona size={PersonaSize.size40} text={currentUser.name} secondaryText={'Sign out'} onRenderSecondaryText={onRenderSecondaryText} />: null}
          <div>
            <DefaultButton text={'Back'} onClick={()=>{
              setPage(PageTypes.AddResources);
              setTitle(DialogTitle.ADD_RESOURCES);
            }} style={{margin: '0 4px'}} />
            <PrimaryButton
              disabled={isDisAble}
              style={{ margin: '0 4px' }}
              text={'Done'}
              onClick={async () => {
                const selectedResources = requireResources.concat(enabledResources);
                await onSubmit({
                  subscription: currentSubscription,
                  resourceGroup: currentResourceGroup,
                  hostname: currentHostName,
                  location: currentLocation,
                  luisLocation: currentLuisLocation?.name || currentLocation.name,
                  type: publishType,
                  externalResources: selectedResources,
                });
              }}
            />
          </div>
        </div>
      )
    }
  }, [
    onSave,
    page,
    choice,
    isEditorError,
    isDisAble,
    currentSubscription,
    currentResourceGroup,
    currentHostName,
    currentLocation,
    publishType,
    extensionResourceOptions,
    currentUser,
    enabledResources,
    requireResources,
    currentLuisLocation,
  ]);

  return (
    <div style={{ height: '100vh' }}>
        {page === PageTypes.ConfigProvision && PageFormConfig}
        {page === PageTypes.AddResources && PageAddResources}
        {page === PageTypes.ReviewResource && PageReview}
      <div
        style={{
          background: '#FFFFFF',
          borderTop: '1px solid #EDEBE9',
          position: 'fixed',
          width: '100%',
          bottom: '0',
          textAlign: 'right',
          height: 'fit-content',
          padding: '24px 0px 0px',
        }}
      >
        {PageFooter}
      </div>
    </div>
  );
};
