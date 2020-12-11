// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import * as React from 'react';
import { useState, useMemo, useEffect, Fragment } from 'react';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import {
  currentProjectId,
  getAccessToken,
  logOut,
  startProvision,
  closeDialog,
  onBack,
  savePublishConfig,
  setTitle,
  getSchema,
  getType,
  getTokenFromCache,
  isGetTokenFromUser,
} from '@bfc/extension-client';
import { Subscription } from '@azure/arm-subscriptions/esm/models';
import { ResourceGroup } from '@azure/arm-resources/esm/models';
import { DeployLocation } from '@botframework-composer/types';
import { ResourcesItem, authConfig, LuisAuthoringSupportLocation, LuisPublishSupportLocation } from '../types';
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
  Sticky,
  StickyPositionType,
  TooltipHost,
  Spinner,
  Persona,
  IPersonaProps,
  PersonaSize,
  Selection,
  SelectionMode,
} from 'office-ui-fabric-react';
import { JsonEditor } from '@bfc/code-editor';
import jwtDecode from 'jwt-decode';
import { getResourceList, getSubscriptions, getResourceGroups, getDeployLocations, getPreview, getLuisAuthoringRegions, CheckWebAppNameAvailability } from './api';

const choiceOptions: IChoiceGroupOption[] = [
  { key: 'create', text: 'Create new Azure resources' },
  { key: 'import', text: 'Import existing Azure resources' },
];
const PageTypes = {
  ConfigProvision: 'config',
  ReviewResource: 'review',
};
const DialogTitle = {
  CONFIG_RESOURCES: {
    title: formatMessage('Configure resources'),
    subText: formatMessage(
      'Composer will create your bot resources in this Azure destination. If you already have assets created then select import'
    ),
  },
  REVIEW: {
    title: formatMessage('Review + Create'),
    subText: formatMessage(
      'Please review the resources that will be created for your bot. Once these resources are provisioned, your resources will be available in your Azure profile'
    ),
  },
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

function decodeToken(token: string) {
  try {
    return jwtDecode<any>(token);
  } catch (err) {
    console.error('decode token error in ', err);
    return null;
  }
}

export const AzureProvisionDialog: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [resourceGroups, setResourceGroups] = useState<ResourceGroup[]>([]);
  const [deployLocations, setDeployLocations] = useState<DeployLocation[]>([]);
  const [luisLocations, setLuisLocations] = useState<string[]>([]);

  const [token, setToken] = useState<string>();
  const [currentUser, setCurrentUser] = useState<any>();

  const [choice, setChoice] = useState(choiceOptions[0]);
  const [currentSubscription, setSubscription] = useState<Subscription>();
  const [currentHostName, setHostName] = useState('');
  const [errorHostName, setErrorHostName] = useState('');
  const [currentLocation, setLocation] = useState<DeployLocation>();
  const [currentLuisLocation, setCurrentLuisLocation] = useState<string>();
  const [extensionResourceOptions, setExtensionResourceOptions] = useState<ResourcesItem[]>([]);
  const [enabledResources, setEnabledResources] = useState<ResourcesItem[]>([]); // create from optional list
  const [requireResources, setRequireResources] = useState<ResourcesItem[]>([]);

  const [isEditorError, setEditorError] = useState(false);
  const [importConfig, setImportConfig] = useState();

  const [page, setPage] = useState(PageTypes.ConfigProvision);
  const [group, setGroup] = useState<IGroup[]>();
  const [listItems, setListItem] = useState<(ResourcesItem & {name,icon})[]>();

  // set type of publish - azurePublish or azureFunctionsPublish
  const publishType = getType();

  const columns: IColumn[] = [
    {
      key: 'icon',
      name: 'File Type',
      iconName: 'Page',
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
      maxWidth: 350,
      isRowHeader: true,
      isResizable: true,
      data: 'string',
      onRender: (item: ResourcesItem & {name,icon}) => {
        return <div>
            {item.name}
            <div>{item.text} | {item.tier}</div>
          </div>;
      },
      isPadded: true,
    },
    {
      key: 'Description',
      name: formatMessage('Description'),
      className: 'description',
      fieldName: 'description',
      minWidth: 300,
      maxWidth: 350,
      isRowHeader: true,
      isResizable: true,
      data: 'string',
      onRender: (item: ResourcesItem & {name,icon}) => {
        return <span>{item.description}</span>;
      },
      isPadded: true,
    }
  ];

  useEffect(() => {
    setTitle(DialogTitle.CONFIG_RESOURCES);
    if(isGetTokenFromUser()){
      const { accessToken } = getTokenFromCache();

      setToken(accessToken);
      // decode token
      const decoded = decodeToken(accessToken);
      if(decoded){
        setCurrentUser({
          token: accessToken,
          email: decoded.upn,
          name: decoded.name,
          expiration: (decoded.exp || 0) * 1000, // convert to ms,
          sessionExpired: false,
        });
      }
    } else {
      getAccessToken(authConfig.arm).then((token)=> {
        setToken(token);
        // decode token
        const decoded = decodeToken(token);
        if(decoded){
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

  useEffect(()=> {
    if(token){
      getSubscriptions(token).then(setSubscriptions);
      getResources();
    }
  },[token]);

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
    return luisLocations.map((t) => ({ key: t, text: t }));
  }, [luisLocations]);

  const updateCurrentSubscription = useMemo(
    () => (_e, option?: IDropdownOption) => {
      const sub = subscriptions.find((t) => t.subscriptionId === option?.key);

      if (sub) {
        setSubscription(sub);
      }
    },
    [subscriptions]
  );

  const checkNameAvailability = useMemo(()=>(newName: string)=>{
    if(currentSubscription){
      // get preview list
      const names = getPreview(newName);
      let app = '';
      if(publishType.includes('Function')) {
        app = names.find(item=>item.key.includes('Function')).name;
      } else {
        app = names.find(item=>item.key === 'webApp').name;
      }
      // check app name whether exist or not
      CheckWebAppNameAvailability(token, app, currentSubscription.subscriptionId).then(value=>{
        if(!value.nameAvailable){
          setErrorHostName(value.message);
        } else {
          setErrorHostName('');
        }
      });
    } else {
      setErrorHostName('');
    }
  }, [publishType, currentSubscription, token]);

  const newResourceGroup = useMemo(
    () => (e, newName) => {
      setHostName(newName);
      // validate existed or not
      const existed = resourceGroups.find((t) => t.name === newName);
      if (existed) {
        setErrorHostName('this resource group already exist');
      } else {
        checkNameAvailability(newName);
      }
    },
    [resourceGroups, checkNameAvailability]
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

  const updateLuisLocation = useMemo(
    () => (_e, option?: IDropdownOption) => {
      const location = luisLocations.find((t) => t === option?.key);
      if (location) {
        setCurrentLuisLocation(location);
      }
    },
    [luisLocations]
  );

  useEffect(() => {
    if (currentSubscription) {
      // get resource group under subscription
      getResourceGroups(token, currentSubscription.subscriptionId).then(setResourceGroups);
      getDeployLocations(token, currentSubscription.subscriptionId).then(setDeployLocations);
      setLuisLocations(getLuisAuthoringRegions());

      if(currentHostName){
        // check its hostname availability
        checkNameAvailability(currentHostName);
      }
    }
  }, [currentSubscription]);

  const onNext = useMemo(
    () => (hostname) => {
      const names = getPreview(hostname);
      const result = extensionResourceOptions.map((resource) => {
        const previewObject = names.find((n) => n.key === resource.key);
        return {
          ...resource,
          name: previewObject ? previewObject.name : `UNKNOWN NAME FOR ${resource.key}`,
          icon: previewObject ? previewObject.icon : undefined,
        };
      });

      // set review list
      const groups: IGroup[] = [];
      const requireList = result.filter(item => item.required);
      setRequireResources(requireList);
      const externalList = result.filter(item => !item.required);
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

      setPage(PageTypes.ReviewResource);
      setTitle(DialogTitle.REVIEW);
    },
    [extensionResourceOptions]
  );

  const onSubmit = useMemo(
    () => async (options) => {
      // call back to the main Composer API to begin this process...
      startProvision(options);
      // TODO: close window
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

  const onRenderSecondaryText= useMemo(
    ()=>(props: IPersonaProps)=>{
      return <div onClick={()=>{ closeDialog(); logOut();}} style={{color:'blue', cursor: 'pointer'}}>{props.secondaryText}</div>;
    },
    []
  );

  const isDisAble = useMemo(() => {
    return !currentSubscription || !currentHostName || errorHostName !== '';
  }, [currentSubscription, currentHostName, errorHostName]);

  const PageFormConfig = (
    <Fragment>
      <ChoiceGroup defaultSelectedKey="create" options={choiceOptions} onChange={updateChoice} />
      {subscriptionOption?.length > 0 && choice.key === 'create' && (
        <form style={{ width: '60%', height:'100%' }}>
          <Dropdown
            required
            defaultSelectedKey={currentSubscription?.subscriptionId}
            label={'Subscription'}
            options={subscriptionOption}
            placeholder={'Select your subscription'}
            onChange={updateCurrentSubscription}
          />
          <TextField
            required
            defaultValue={currentHostName}
            errorMessage={errorHostName}
            label={'HostName'}
            placeholder={'Name of your new resource group'}
            onChange={newResourceGroup}
          />
          <Dropdown
            required
            defaultSelectedKey={currentLocation?.id}
            label={'Locations'}
            options={deployLocationsOption}
            placeholder={'Select your location'}
            onChange={updateCurrentLocation}
          />
          {currentLocation && luisLocations.length>0 && !luisLocations.includes(currentLocation.name) ?
          <Dropdown
            required
            label={'Location for Luis'}
            options={luisLocationsOption}
            placeholder={'Select your location'}
            onChange={updateLuisLocation}
          />: null}
        </form>
      )}
      {choice.key === 'create' && subscriptionOption.length < 1 && <Spinner label="Loading" />}
      {choice.key === 'import' && (
        <div style={{ width: '60%', marginTop: '10px', height: '100%' }}>
          <div>Publish Configuration</div>
          <JsonEditor
            id={publishType}
            height={200}
            value={importConfig}
            onChange={(value) => {
              setEditorError(false);
              setImportConfig(value);
            }}
            schema={getSchema()}
            onError={() => {
              setEditorError(true);
            }}
          />
        </div>
      )}
    </Fragment>
  );

  const selection = useMemo(() => {
     const s =  new Selection({
      onSelectionChanged: () => {
        const list = s.getSelection();
        setEnabledResources(list);
      },
      canSelectItem: (item, index) => {
        return item.required === false;
      },
    });
    if(s && listItems){
      s.setItems(listItems,false);
      s.setAllSelected(true);
    }
    return s;
  }, [listItems]);

  const PageReview = useMemo(() => {
    return (
      <Fragment>
        <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto} style={{height: 'calc(100vh - 50px)'}}>
        <DetailsList
          isHeaderVisible
          checkboxVisibility={CheckboxVisibility.onHover}
          selectionMode={SelectionMode.multiple}
          selection={selection}
          columns={columns}
          getKey={(item) => item.key}
          groups={group}
          items={listItems}
          layoutMode={DetailsListLayoutMode.justified}
          setKey="none"
          onRenderDetailsHeader={onRenderDetailsHeader}
        />
        </ScrollablePane>
      </Fragment>
    );
  }, [group, listItems, selection]);

  const PageFooter = useMemo(() => {
    if (page === PageTypes.ConfigProvision) {
      return (
        <div style={{display: 'flex', flexFlow: 'row nowrap', justifyContent: 'space-between'}}>
          {currentUser? <Persona size={PersonaSize.size40} text={currentUser.name} secondaryText={'log out'} onRenderSecondaryText={onRenderSecondaryText} />: null}
          <div>
            <DefaultButton text={'Back'} onClick={onBack} style={{margin: '0 4px'}} />
            {choice.key === 'create' ? (
              <PrimaryButton
                disabled={isDisAble}
                text="Next"
                onClick={() => {
                  onNext(currentHostName);
                }}
                style={{margin: '0 4px'}}
              />
            ) : (
              <PrimaryButton disabled={isEditorError} text="Save" onClick={onSave} style={{margin: '0 4px'}} />
            )}
          </div>
        </div>
      );
    } else {
      return (
        <div style={{display: 'flex', flexFlow: 'row nowrap', justifyContent: 'space-between'}}>
          {currentUser? <Persona size={PersonaSize.size40} text={currentUser.name} secondaryText={'log out'} onRenderSecondaryText={onRenderSecondaryText} />: null}
          <div>
            <DefaultButton
              text={'Back'}
              onClick={() => {
                setPage(PageTypes.ConfigProvision);
                setTitle(DialogTitle.CONFIG_RESOURCES);
              }}
              style={{margin: '0 4px'}}
            />
            <PrimaryButton
              disabled={isDisAble}
              text={'Done'}
              onClick={async () => {
                const selectedResources = requireResources.concat(enabledResources);
                await onSubmit({
                  subscription: currentSubscription,
                  hostname: currentHostName,
                  location: currentLocation,
                  luisLocation: currentLuisLocation || currentLocation.name,
                  type: publishType,
                  externalResources: selectedResources,
                });
              }}
              style={{margin: '0 4px'}}
            />
          </div>
        </div>
      );
    }
  }, [
    onSave,
    page,
    choice,
    isEditorError,
    isDisAble,
    currentSubscription,
    currentHostName,
    currentLocation,
    publishType,
    extensionResourceOptions,
    currentUser,
    enabledResources,
    requireResources,
    currentLuisLocation
  ]);

  return (
    <div style={{ height: '100vh' }}>
        {page === PageTypes.ConfigProvision ? PageFormConfig : PageReview}
      <div
        style={{
          background: '#FFFFFF',
          borderTop: '1px solid #000',
          position: 'fixed',
          width: '100%',
          bottom: '0',
          textAlign: 'right',
          height:'fit-content',
          padding: '16px 0px 0px',
        }}
      >
        {PageFooter}
      </div>
    </div>
  );
};
