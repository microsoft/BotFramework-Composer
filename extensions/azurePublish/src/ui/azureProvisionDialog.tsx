// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import formatMessage from 'format-message';
import * as React from 'react';
import { useState, useMemo, useEffect, Fragment } from 'react';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
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
import { ResourcesItem, authConfig} from '../types';
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
  Sticky,
  StickyPositionType,
  TooltipHost,
  Icon,
  TextField,
  Spinner,
  Persona,
  IPersonaProps,
  PersonaSize,
  Selection,
  SelectionMode,
  DetailsRow,
} from 'office-ui-fabric-react';
import { SharedColors } from '@uifabric/fluent-theme';
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
      'How you would like to provision your Azure resources to publish your bot?'
    ),
  },
  REVIEW: {
    title: formatMessage('Review & create'),
    subText: formatMessage(
      'Please review the resources that will be created for your bot. Once these resources are provisioned, they will be available in your Azure portal.'
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
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      marginBottom: '5px'
    }}>
      <div style={{
        marginRight: '5px',
        fontWeight: 600,
        fontSize: '14px'
      }}> {props.label} </div>
      <TooltipHost content={props.ariaLabel}>
        <Icon iconName="Info" styles={iconStyle(props.required)} />
      </TooltipHost>
    </div>
  );
};

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
            <div style={{fontSize: '14px', color: NeutralColors.gray190}}>{item.name}</div>
            <div style={{fontSize: '12px', color: NeutralColors.gray130}}>{item.text} | {item.tier}</div>
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
      checkNameAvailability(newName);
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
      <ChoiceGroup style={{}} defaultSelectedKey="create" options={choiceOptions} onChange={updateChoice} />
      {subscriptionOption?.length > 0 && choice.key === 'create' && (
        <form style={{ width: '50%', marginTop: '16px' }}>
          <Dropdown
            required
            defaultSelectedKey={currentSubscription?.subscriptionId}
            label={formatMessage('Subscription')}
            ariaLabel={formatMessage('All resources in an Azure subscription are billed together')}
            options={subscriptionOption}
            placeholder={'Select one'}
            onChange={updateCurrentSubscription}
            styles={{ root: { paddingBottom: '8px' } }}
            onRenderLabel={onRenderLabel}
          />
          <TextField
            required
            defaultValue={currentHostName}
            errorMessage={errorHostName}
            label={formatMessage('Resource group name')}
            ariaLabel={formatMessage('A resource group is a collection of resources that share the same lifecycle, permissions, and policies')}
            placeholder={'Name of your new resource group'}
            onChange={newResourceGroup}
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
          {currentLocation && luisLocations.length>0 && !luisLocations.includes(currentLocation.name) ?
          <Dropdown
            required
            label={'Region for Luis'}
            options={luisLocationsOption}
            placeholder={'Select one'}
            onChange={updateLuisLocation}
          />: null}
        </form>
      )}
      {choice.key === 'create' && subscriptionOption.length < 1 && <Spinner label="Loading" />}
      {choice.key === 'import' && (
        <div style={{ width: '50%', marginTop: '10px', height: '100%' }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#323130',
            padding: '5px 0px'
          }}>{formatMessage('Publish Configuration')}</div>
          <JsonEditor
            id={publishType}
            height={300}
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
        <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto} style={{height: 'calc(100vh - 64px)'}}>
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
          />
        </ScrollablePane>
      </Fragment>
    );
  }, [group, listItems, selection]);

  const PageFooter = useMemo(() => {
    if (page === PageTypes.ConfigProvision) {
      return (
        <div style={{display: 'flex', flexFlow: 'row nowrap', justifyContent: 'space-between'}}>
          {currentUser? <Persona size={PersonaSize.size40} text={currentUser.name} secondaryText={'Sign out'} onRenderSecondaryText={onRenderSecondaryText} />: null}
          <div>
            <DefaultButton text={'Back'} onClick={onBack} style={{margin: '0 4px'}} />
            {choice.key === 'create' ? (
              <PrimaryButton
                disabled={isDisAble}
                text="Next: Review"
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
          {currentUser? <Persona size={PersonaSize.size40} text={currentUser.name} secondaryText={'Sign out'} onRenderSecondaryText={onRenderSecondaryText} />: null}
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
          borderTop: '1px solid #EDEBE9',
          position: 'fixed',
          width: '100%',
          bottom: '0',
          textAlign: 'right',
          height:'fit-content',
          padding: '24px 0px 0px',
        }}
      >
        {PageFooter}
      </div>
    </div>
  );
};
