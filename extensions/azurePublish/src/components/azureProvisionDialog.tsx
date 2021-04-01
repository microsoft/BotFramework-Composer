// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import * as React from 'react';
import formatMessage from 'format-message';
import styled from '@emotion/styled';
import { useState, useMemo, useEffect, Fragment, useCallback, useRef, Suspense } from 'react';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { logOut, usePublishApi, getTenants, getARMTokenForTenant, useLocalStorage } from '@bfc/extension-client';
import { Subscription } from '@azure/arm-subscriptions/esm/models';
import { DeployLocation, AzureTenant } from '@botframework-composer/types';
import { FluentTheme, NeutralColors } from '@uifabric/fluent-theme';
import { LoadingSpinner } from '@bfc/ui-shared';
import { ProvisionHandoff } from '@bfc/ui-shared';
import {
  ScrollablePane,
  ScrollbarVisibility,
  ChoiceGroup,
  IChoiceGroupOption,
  DetailsList,
  DetailsListLayoutMode,
  IColumn,
  TooltipHost,
  Icon,
  TextField,
  Spinner,
  Persona,
  IPersonaProps,
  PersonaSize,
  SelectionMode,
  Stack,
  Text,
} from 'office-ui-fabric-react';
import { JsonEditor } from '@bfc/code-editor';
import { SharedColors } from '@uifabric/fluent-theme';
import { ResourceGroup } from '@azure/arm-resources/esm/models';

import { AzureResourceTypes, ResourcesItem } from '../types';

import {
  getResourceList,
  getSubscriptions,
  getDeployLocations,
  getPreview,
  getLuisAuthoringRegions,
  CheckWebAppNameAvailability,
  getResourceGroups,
} from './api';
import { ChooseResourcesList } from './ChooseResourcesList';
import { getExistResources, removePlaceholder, decodeToken, defaultExtensionState } from './util';
import { ResourceGroupPicker } from './ResourceGroupPicker';

// ---------- Styles ---------- //

const AddResourcesSectionName = styled(Text)`
  font-size: ${FluentTheme.fonts.mediumPlus.fontSize};
`;

const labelTooltipStyles = {
  root: {
    userSelect: 'none',
  },
};

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

const choiceOptions: IChoiceGroupOption[] = [
  { key: 'create', text: 'Create new Azure resources' },
  { key: 'import', text: 'Import existing Azure resources' },
  { key: 'generate', text: 'Generate resource request' },
];

const PageTypes = {
  SelectTenant: 'tenant',
  ConfigProvision: 'config',
  AddResources: 'add',
  ReviewResource: 'review',
  EditJson: 'edit',
};

const DialogTitle = {
  CONFIG_RESOURCES: {
    title: formatMessage('Configure resources'),
    subText: formatMessage('How you would like to provision your Azure resources to publish your bot?'),
  },
  ADD_RESOURCES: {
    title: formatMessage('Add resources'),
    subText: formatMessage(
      'Your bot needs the following resources based on its capabilities. Select resources that you want to provision in your publishing profile.'
    ),
  },
  REVIEW: {
    title: formatMessage('Review & create'),
    subText: formatMessage(
      'Please review the resources that will be created for your bot. Once these resources are provisioned, they will be available in your Azure portal.'
    ),
  },
  EDIT: {
    title: formatMessage('Configure resources'),
    subText: formatMessage('How you would like to provision your Azure resources to publish your bot?'),
  },
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
      <TooltipHost content={props.ariaLabel} styles={labelTooltipStyles}>
        <Icon iconName="Info" styles={iconStyle(props.required)} />
      </TooltipHost>
    </div>
  );
};

const reviewCols: IColumn[] = [
  {
    key: 'Icon',
    name: 'File Type',
    isIconOnly: true,
    fieldName: 'name',
    minWidth: 16,
    maxWidth: 16,
    onRender: (item: ResourcesItem & { name; icon }) => {
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
      return (
        <div style={{ whiteSpace: 'normal', fontSize: '12px', color: NeutralColors.gray130 }}>{item.resourceGroup}</div>
      );
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
    onRender: (item: ResourcesItem & { name; icon }) => {
      return <div style={{ whiteSpace: 'normal', fontSize: '12px', color: NeutralColors.gray130 }}>{item.name}</div>;
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
    onRender: (item: ResourcesItem) => {
      return (
        <div style={{ whiteSpace: 'normal', fontSize: '12px', color: NeutralColors.gray130 }}>
          {item.key === AzureResourceTypes.APP_REGISTRATION ? 'global' : item?.region}
        </div>
      );
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
    getName,
    getTokenFromCache,
    isGetTokenFromUser,
    getTenantIdFromCache,
    setTenantId,
  } = usePublishApi();

  const { setItem, getItem, clearAll } = useLocalStorage();
  // set type of publish - azurePublish or azureFunctionsPublish
  const publishType = getType();
  const profileName = getName();
  const currentConfig = removePlaceholder(publishConfig);
  const extensionState = { ...defaultExtensionState, ...getItem(profileName) };

  const [subscriptions, setSubscriptions] = useState<Subscription[] | undefined>();
  const [subscriptionsErrorMessage, setSubscriptionsErrorMessage] = useState<string>();
  const [deployLocations, setDeployLocations] = useState<DeployLocation[]>([]);
  const [luisLocations, setLuisLocations] = useState<DeployLocation[]>([]);

  const [allTenants, setAllTenants] = useState<AzureTenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string>();
  const [token, setToken] = useState<string>();
  const [currentUser, setCurrentUser] = useState<any>(undefined);
  const [loginErrorMsg, setLoginErrorMsg] = useState<string>('');

  const [choice, setChoice] = useState(extensionState.choice);
  const [currentSubscription, setCurrentSubscription] = useState<string>(extensionState.subscriptionId);

  const [resourceGroups, setResourceGroups] = useState<ResourceGroup[]>();
  const [isNewResourceGroupName, setIsNewResourceGroupName] = useState<boolean>(true);
  const [currentResourceGroupName, setCurrentResourceGroupName] = useState<string>(extensionState.resourceGroup);
  const [errorResourceGroupName, setErrorResourceGroupName] = useState<string>();

  const [currentHostName, setHostName] = useState(extensionState.hostName);
  const [errorHostName, setErrorHostName] = useState('');
  const [currentLocation, setLocation] = useState<string>(currentConfig?.region || extensionState.location);
  const [currentLuisLocation, setCurrentLuisLocation] = useState<string>(
    currentConfig?.settings?.luis?.region || extensionState.luisLocation
  );
  const [extensionResourceOptions, setExtensionResourceOptions] = useState<ResourcesItem[]>([]);
  const [enabledResources, setEnabledResources] = useState<ResourcesItem[]>(extensionState.enabledResources); // create from optional list
  const [requireResources, setRequireResources] = useState<ResourcesItem[]>(extensionState.requiredResources);

  const [isEditorError, setEditorError] = useState(false);
  const [importConfig, setImportConfig] = useState<any>();

  const [page, setPage] = useState<string>(PageTypes.ConfigProvision);
  const [listItems, setListItems] = useState<(ResourcesItem & { icon?: string })[]>();
  const [reviewListItems, setReviewListItems] = useState<ResourcesItem[]>([]);
  const isMounted = useRef<boolean>();

  const timerRef = useRef<NodeJS.Timeout>();

  const [handoffInstructions, setHandoffInstructions] = useState<string>('');
  const [showHandoff, setShowHandoff] = useState<boolean>(false);
  const updateHandoffInstructions = (resources) => {
    const createLuisResource = resources.filter((r) => r.key === 'luisPrediction').length > 0;
    const createLuisAuthoringResource = resources.filter((r) => r.key === 'luisAuthoring').length > 0;
    const createCosmosDb = resources.filter((r) => r.key === 'cosmosDb').length > 0;
    const createStorage = resources.filter((r) => r.key === 'blobStorage').length > 0;
    const createAppInsights = resources.filter((r) => r.key === 'applicationInsights').length > 0;
    const createQnAResource = resources.filter((r) => r.key === 'qna').length > 0;

    const provisionComposer = `node provisionComposer.js --subscriptionId ${
      currentSubscription ?? '<YOUR SUBSCRIPTION ID>'
    } --name ${currentHostName ?? '<RESOURCE NAME>'}
    --appPassword=<16 CHAR PASSWORD>
    --location=${currentLocation || 'westus'}
    --resourceGroup=${currentResourceGroup || '<RESOURCE GROUP NAME>'}
    --createLuisResource=${createLuisResource}
    --createLuisAuthoringResource=${createLuisAuthoringResource}
    --createCosmosDb=${createCosmosDb}
    --createStorage=${createStorage}
    --createAppInsights=${createAppInsights}
    --createQnAResource=${createQnAResource}
    `;

    const instructions = formatMessage(
      'A hosting environment and some Azure cognitive services are required for this bot project to be published.  You can find instructions for creating the necessary resources and communicating them back to me at the link below: \n\nSOME LINK GOES HERE\n\nIn addition, here is a customized command that you can use to automatically create the required resources:\n\n {command}',
      { command: provisionComposer }
    );

    setHandoffInstructions(instructions);
  };

  useEffect(() => {
    const selectedResources = requireResources.concat(enabledResources);
    updateHandoffInstructions(selectedResources);
  }, [enabledResources]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const getTokenForTenant = (tenantId: string) => {
    // set tenantId in cache.
    setTenantId(tenantId);
    getARMTokenForTenant(tenantId)
      .then((token) => {
        setToken(token);
        const decoded = decodeToken(token);
        setCurrentUser({
          token: token,
          email: decoded.upn,
          name: decoded.name,
          expiration: (decoded.exp || 0) * 1000, // convert to ms,
          sessionExpired: false,
        });
        setPage(PageTypes.ConfigProvision);
        setTitle(DialogTitle.CONFIG_RESOURCES);
        setLoginErrorMsg(undefined);
      })
      .catch((err) => {
        setTenantId(undefined);
        setCurrentUser(undefined);
        setLoginErrorMsg(err.message || err.toString());
      });
  };

  useEffect(() => {
    // TODO: need to get the tenant id from the auth config when running as web app,
    // for electron we will always fetch tenants.
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
      getTenants().then((tenants) => {
        setAllTenants(tenants);
        if (!getTenantIdFromCache()) {
          if (isMounted.current && tenants?.length > 0) {
            // if there is only 1 tenant, go ahead and fetch the token and store it in the cache
            if (tenants.length === 1) {
              setSelectedTenant(tenants[0].tenantId);
              // getTokenForTenant(tenants[0].tenantId);
            } else {
              // seed tenant selection with first tenant
              setSelectedTenant(tenants[0].tenantId);
            }
          }
        } else {
          setSelectedTenant(getTenantIdFromCache());
        }
      });
    }
  }, []);

  useEffect(() => {
    if (selectedTenant) {
      getTokenForTenant(selectedTenant);
    }
  }, [selectedTenant]);

  useEffect(() => {
    if (currentConfig) {
      if (currentConfig.tennantId) {
        setSelectedTenant(currentConfig.tennantId);
      }
      if (currentConfig.subscriptionId) {
        setCurrentSubscription(currentConfig.subscriptionId);
      }
      if (currentConfig.resourceGroup) {
        setCurrentResourceGroupName(currentConfig.resourceGroup);
      }
      if (currentConfig.hostname) {
        setHostName(currentConfig.hostname);
      } else if (currentConfig.name) {
        setHostName(
          currentConfig.environment ? `${currentConfig.name}-${currentConfig.environment}` : currentConfig.name
        );
      }
    }
  }, [currentConfig]);

  const getResources = async () => {
    try {
      if (isMounted.current) {
        const resources = await getResourceList(currentProjectId(), publishType);
        setExtensionResourceOptions(resources);
      }
    } catch (err) {
      // todo: how do we handle API errors in this component
      console.log('ERROR', err);
    }
  };

  useEffect(() => {
    if (token) {
      setSubscriptionsErrorMessage(undefined);
      getSubscriptions(token)
        .then((data) => {
          if (isMounted.current) {
            setSubscriptions(data);
            if (data.length === 0) {
              setSubscriptionsErrorMessage(
                formatMessage(
                  'Your subscription list is empty, please add your subscription, or login with another account.'
                )
              );
            }
          }
        })
        .catch((err) => {
          if (isMounted.current) {
            setSubscriptionsErrorMessage(err.message);
          }
        });

      getResources();
    }
  }, [token]);

  const loadResourceGroups = async () => {
    if (token && currentSubscription) {
      try {
        const resourceGroups = await getResourceGroups(token, currentSubscription);
        if (isMounted.current) {
          setResourceGroups(resourceGroups);

          // After the resource groups load, isNewResourceGroupName can be determined
          setIsNewResourceGroupName(!resourceGroups?.some((r) => r.name === currentResourceGroupName));
        }
      } catch (err) {
        // todo: how do we handle API errors in this component
        console.log('ERROR', err);
        if (isMounted.current) {
          setResourceGroups(undefined);
        }
      }
    } else {
      setResourceGroups(undefined);
    }
  };

  useEffect(() => {
    loadResourceGroups();
  }, [token, currentSubscription]);

  const subscriptionOptions = useMemo(() => {
    return subscriptions?.map((t) => ({ key: t.subscriptionId, text: t.displayName }));
  }, [subscriptions]);

  const deployLocationsOption = useMemo((): IDropdownOption[] => {
    return deployLocations.map((t) => ({ key: t.name, text: t.displayName }));
  }, [deployLocations]);

  const luisLocationsOption = useMemo((): IDropdownOption[] => {
    return luisLocations.map((t) => ({ key: t.name, text: t.displayName }));
  }, [luisLocations]);

  const checkNameAvailability = useCallback(
    (newName: string) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        if (currentSubscription && publishType === 'azurePublish') {
          // check app name whether exist or not
          CheckWebAppNameAvailability(token, newName, currentSubscription).then((value) => {
            if (isMounted.current) {
              if (!value.nameAvailable) {
                setErrorHostName(value.message);
              } else {
                setErrorHostName('');
              }
            }
          });
        }
      }, 500);
    },
    [publishType, currentSubscription, token]
  );

  const newHostName = useCallback(
    (e, newName) => {
      setHostName(newName);
      // debounce name check
      checkNameAvailability(newName);
    },
    [checkNameAvailability]
  );

  const updateCurrentLocation = useMemo(
    () => (_e, option?: IDropdownOption) => {
      const location = deployLocations.find((t) => t.name === option?.key);
      if (location) {
        setLocation(location.name);
        const region = luisLocations.find((item) => item.name === location.name);
        if (region) {
          setCurrentLuisLocation(region.name);
        } else {
          setCurrentLuisLocation(luisLocations[0].name);
        }
      }
    },
    [deployLocations, luisLocations]
  );

  const updateLuisLocation = useMemo(
    () => (_e, option?: IDropdownOption) => {
      const location = luisLocations.find((t) => t.name === option?.key);
      if (location) {
        setCurrentLuisLocation(location.name);
      }
    },
    [luisLocations]
  );

  useEffect(() => {
    if (currentSubscription && token) {
      // get resource group under subscription
      getDeployLocations(token, currentSubscription).then((data: DeployLocation[]) => {
        if (isMounted.current) {
          setDeployLocations(data);
          const luRegions = getLuisAuthoringRegions();
          const region = data.filter((item) => luRegions.includes(item.name));
          setLuisLocations(region);
        }
      });
    }
  }, [currentSubscription, token]);

  const onNext = useMemo(
    () => (hostname) => {
      // get resources already have
      const alreadyHave = getExistResources(currentConfig);

      const names = getPreview(hostname);
      const result = [];
      for (const resource of extensionResourceOptions) {
        if (alreadyHave.find((item) => item === resource.key)) {
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
      const requireList = result.filter((item) => item.required);
      setRequireResources(requireList);
      const optionalList = result.filter((item) => !item.required);
      setEnabledResources(optionalList);
      const items = requireList.concat(optionalList);
      setListItems(items);

      setPage(PageTypes.AddResources);
      setTitle(DialogTitle.ADD_RESOURCES);
    },
    [extensionResourceOptions]
  );

  const onSubmit = useCallback((options) => {
    // call back to the main Composer API to begin this process...
    startProvision(options);
    clearAll();
    closeDialog();
  }, []);

  const onSave = useMemo(
    () => () => {
      savePublishConfig(importConfig);
      clearAll();
      closeDialog();
    },
    [importConfig]
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

  const isNextDisabled = useMemo(() => {
    return (
      !currentSubscription ||
      !currentResourceGroupName ||
      !currentHostName ||
      !currentLocation ||
      subscriptionsErrorMessage ||
      errorResourceGroupName ||
      errorHostName !== ''
    );
  }, [
    currentSubscription,
    currentResourceGroupName,
    currentHostName,
    currentLocation,
    errorResourceGroupName,
    errorHostName,
  ]);

  const isSelectAddResources = useMemo(() => {
    return enabledResources.length > 0 || requireResources.length > 0;
  }, [enabledResources]);

  const resourceGroupNames = resourceGroups?.map((r) => r.name) || [];

  const PageFormConfig = (
    <ScrollablePane
      data-is-scrollable="true"
      scrollbarVisibility={ScrollbarVisibility.auto}
      style={{ height: 'calc(100vh - 64px)' }}
    >
      <div style={{ display: 'flex', height: '100%' }}>
        <div style={{ flex: '0 0 auto', marginRight: '2rem' }}>
          <ChoiceGroup
            options={choiceOptions}
            selectedKey={choice?.key || 'create'}
            onChange={(_e, option: IChoiceGroupOption) => {
              setChoice(option);
            }}
          />
        </div>
        <div style={{ flex: 1, height: '100%' }}>
          <Suspense fallback={<Spinner label={formatMessage('Loading')} />}>
            {choice.key === 'create' && (
              <form style={{ width: '100%' }}>
                <Dropdown
                  ariaLabel={formatMessage(
                    'The Azure AD directory includes the tenant’s users, groups, and apps and is used to perform identity and access management functions for tenant resources.'
                  )}
                  disabled={allTenants.length === 1 || currentConfig?.tenantId}
                  errorMessage={loginErrorMsg}
                  label={formatMessage('Azure Directory')}
                  options={allTenants.map((t) => ({ key: t.tenantId, text: t.displayName }))}
                  selectedKey={selectedTenant}
                  styles={{ root: { paddingBottom: '8px' } }}
                  onChange={(_e, o) => {
                    setSelectedTenant(o.key as string);
                  }}
                  onRenderLabel={onRenderLabel}
                />
                <Dropdown
                  required
                  ariaLabel={formatMessage('All resources in an Azure subscription are billed together')}
                  disabled={currentConfig?.subscriptionId}
                  errorMessage={subscriptionsErrorMessage}
                  label={formatMessage('Subscription')}
                  options={subscriptionOptions}
                  placeholder={formatMessage('Select one')}
                  selectedKey={currentSubscription}
                  styles={{ root: { paddingBottom: '8px' } }}
                  onChange={(_e, o: IDropdownOption) => {
                    setCurrentSubscription(o.key as string);
                  }}
                  onRenderLabel={onRenderLabel}
                />
                <ResourceGroupPicker
                  newResourceGroupName={isNewResourceGroupName ? currentResourceGroupName : undefined}
                  resourceGroupNames={resourceGroupNames}
                  selectedResourceGroupName={isNewResourceGroupName ? undefined : currentResourceGroupName}
                  onChange={(choice) => {
                    setIsNewResourceGroupName(choice.isNew);
                    setCurrentResourceGroupName(choice.name);
                    setErrorResourceGroupName(choice.errorMessage);
                  }}
                />
                <TextField
                  required
                  ariaLabel={formatMessage(
                    'This name will be assigned to all your new resources. For eg-test-web app, test-luis-prediction'
                  )}
                  defaultValue={currentHostName}
                  disabled={currentConfig?.hostname || currentConfig?.name}
                  errorMessage={errorHostName}
                  label={formatMessage('Resource name')}
                  placeholder={formatMessage('Name of your services')}
                  styles={{ root: { paddingBottom: '8px' } }}
                  onChange={newHostName}
                  onRenderLabel={onRenderLabel}
                />
                {currentConfig?.region ? (
                  <TextField
                    required
                    defaultValue={currentConfig?.region}
                    disabled={currentConfig?.region}
                    label={formatMessage('Region')}
                    styles={{ root: { paddingBottom: '8px' } }}
                    onRenderLabel={onRenderLabel}
                  />
                ) : (
                  <Dropdown
                    required
                    defaultSelectedKey={currentLocation}
                    label={formatMessage('Region')}
                    options={deployLocationsOption}
                    placeholder={formatMessage('Select one')}
                    styles={{ root: { paddingBottom: '8px' } }}
                    onChange={updateCurrentLocation}
                  />
                )}
                {currentConfig?.settings?.luis?.region && currentLocation !== currentLuisLocation && (
                  <TextField
                    disabled
                    required
                    defaultValue={currentConfig?.settings?.luis?.region}
                    label={formatMessage('Region for Luis')}
                    styles={{ root: { paddingBottom: '8px' } }}
                    onRenderLabel={onRenderLabel}
                  />
                )}
                {!currentConfig?.settings?.luis?.region && currentLocation !== currentLuisLocation && (
                  <Dropdown
                    required
                    defaultSelectedKey={currentConfig?.settings?.luis?.region || currentLuisLocation}
                    label={formatMessage('Region for Luis')}
                    options={luisLocationsOption}
                    placeholder={formatMessage('Select one')}
                    onChange={updateLuisLocation}
                  />
                )}
              </form>
            )}
            {choice.key === 'import' && (
              <div style={{ width: '100%', height: '100%' }}>
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
                  id={publishType}
                  schema={getSchema()}
                  value={currentConfig || importConfig}
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
          </Suspense>
        </div>
      </div>
    </ScrollablePane>
  );

  useEffect(() => {
    if (listItems?.length === 0) {
      setTitle(DialogTitle.EDIT);
      setPage(PageTypes.EditJson);
    }
  }, [listItems]);

  const PageAddResources = () => {
    if (listItems) {
      const requiredListItems = listItems.filter((item) => item.required);
      const optionalListItems = listItems.filter((item) => !item.required);
      const selectedResourceKeys = enabledResources.map((r) => r.key);

      return (
        <ScrollablePane
          data-is-scrollable="true"
          scrollbarVisibility={ScrollbarVisibility.auto}
          style={{ height: 'calc(100vh - 64px)' }}
        >
          <Stack>
            {requiredListItems.length > 0 && (
              <Fragment>
                <AddResourcesSectionName>{formatMessage('Required')}</AddResourcesSectionName>
                <ChooseResourcesList items={requiredListItems} />
              </Fragment>
            )}
            {optionalListItems.length > 0 && (
              <Fragment>
                <AddResourcesSectionName>{formatMessage('Optional')}</AddResourcesSectionName>
                <ChooseResourcesList
                  items={optionalListItems}
                  selectedKeys={selectedResourceKeys}
                  onSelectionChanged={(keys) => {
                    const newSelection = optionalListItems.filter((item) => keys.includes(item.key));
                    setEnabledResources(newSelection);
                  }}
                />
              </Fragment>
            )}
          </Stack>
        </ScrollablePane>
      );
    } else {
      return <Fragment />;
    }
  };

  const PageReview = (
    <Fragment>
      <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto} style={{ height: 'calc(100vh - 64px)' }}>
        <DetailsList
          isHeaderVisible
          columns={reviewCols}
          getKey={(item) => item.key}
          items={reviewListItems}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.none}
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
              secondaryText={formatMessage('Sign out')}
              size={PersonaSize.size40}
              text={currentUser.name}
              onRenderSecondaryText={onRenderSecondaryText}
            />
          ) : (
            <div
              style={{ color: 'blue', cursor: 'pointer' }}
              onClick={() => {
                clearAll();
                closeDialog();
                logOut();
              }}
            >
              Sign out
            </div>
          )}
          <div>
            <DefaultButton
              style={{ margin: '0 4px' }}
              text={formatMessage('Back')}
              onClick={() => {
                clearAll();
                setItem(profileName, {
                  subscriptionId: currentSubscription,
                  resourceGroup: currentResourceGroupName,
                  hostName: currentHostName,
                  location: currentLocation,
                  luisLocation: currentLuisLocation,
                  enabledResources: enabledResources,
                  requiredResources: requireResources,
                  choice: choice,
                });
                onBack();
              }}
            />
            {choice.key === 'create' && (
              <PrimaryButton
                disabled={isNextDisabled}
                style={{ margin: '0 4px' }}
                text={formatMessage('Next: Review')}
                onClick={() => {
                  onNext(currentHostName);
                }}
              />
            )}
            {choice.key === 'generate' && (
              <PrimaryButton
                style={{ margin: '0 4px' }}
                text={formatMessage('Generate resource request')}
                onClick={() => onNext(currentHostName)}
              />
            )}
            {choice.key === 'import' && (
              <PrimaryButton
                disabled={isEditorError}
                style={{ margin: '0 4px' }}
                text={formatMessage('Save')}
                onClick={onSave}
              />
            )}
          </div>
        </div>
      );
    } else if (page === PageTypes.AddResources) {
      return (
        <div style={{ display: 'flex', flexFlow: 'row nowrap', justifyContent: 'space-between' }}>
          {currentUser ? (
            <Persona
              secondaryText={formatMessage('Sign out')}
              size={PersonaSize.size40}
              text={currentUser.name}
              onRenderSecondaryText={onRenderSecondaryText}
            />
          ) : null}
          <div>
            <DefaultButton
              style={{ margin: '0 4px' }}
              text={formatMessage('Back')}
              onClick={() => {
                setPage(PageTypes.ConfigProvision);
                setTitle(DialogTitle.CONFIG_RESOURCES);
              }}
            />
            <PrimaryButton
              disabled={!isSelectAddResources}
              style={{ margin: '0 4px' }}
              text={formatMessage('Next')}
              onClick={() => {
                if (choice.key === 'generate') {
                  setShowHandoff(true);
                } else {
                  setPage(PageTypes.ReviewResource);
                  setTitle(DialogTitle.REVIEW);
                  let selectedResources = requireResources.concat(enabledResources);
                  selectedResources = selectedResources.map((item) => {
                    let region = currentConfig?.region || currentLocation;
                    if (item.key.includes('luis')) {
                      region = currentLuisLocation;
                    }
                    return {
                      ...item,
                      region: region,
                      resourceGroup: currentConfig?.resourceGroup || currentResourceGroupName,
                    };
                  });
                  setReviewListItems(selectedResources);
                }
              }}
            />
          </div>
        </div>
      );
    } else if (page === PageTypes.ReviewResource) {
      return (
        <div style={{ display: 'flex', flexFlow: 'row nowrap', justifyContent: 'space-between' }}>
          {currentUser ? (
            <Persona
              secondaryText={formatMessage('Sign out')}
              size={PersonaSize.size40}
              text={currentUser.name}
              onRenderSecondaryText={onRenderSecondaryText}
            />
          ) : null}
          <div>
            <DefaultButton
              style={{ margin: '0 4px' }}
              text={formatMessage('Back')}
              onClick={() => {
                setPage(PageTypes.AddResources);
                setTitle(DialogTitle.ADD_RESOURCES);
              }}
            />
            <PrimaryButton
              disabled={isNextDisabled}
              style={{ margin: '0 4px' }}
              text={formatMessage('Done')}
              onClick={() => {
                const selectedResources = requireResources.concat(enabledResources);
                onSubmit({
                  subscription: currentSubscription,
                  resourceGroup: currentResourceGroupName,
                  hostname: currentHostName,
                  location: currentLocation,
                  luisLocation: currentLuisLocation || currentLocation,
                  type: publishType,
                  externalResources: selectedResources,
                });
              }}
            />
          </div>
        </div>
      );
    } else {
      return (
        <>
          <DefaultButton
            style={{ margin: '0 4px' }}
            text={formatMessage('Cancel')}
            onClick={() => {
              closeDialog();
            }}
          />
          <PrimaryButton
            disabled={isEditorError}
            style={{ margin: '0 4px' }}
            text={formatMessage('Save')}
            onClick={onSave}
          />
        </>
      );
    }
  }, [
    onSave,
    page,
    choice,
    isEditorError,
    isNextDisabled,
    currentSubscription,
    currentResourceGroupName,
    currentHostName,
    currentLocation,
    publishType,
    extensionResourceOptions,
    currentUser,
    enabledResources,
    requireResources,
    currentLuisLocation,
    selectedTenant,
  ]);

  // if we haven't loaded the token yet, show a loading spinner
  // unless we need to select the tenant first
  if (!token) {
    return (
      <div style={{ height: '100vh' }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ flex: 1 }}>
        {page === PageTypes.ConfigProvision && PageFormConfig}
        {page === PageTypes.AddResources && PageAddResources()}
        {page === PageTypes.ReviewResource && PageReview}
        {page === PageTypes.EditJson && (
          <JsonEditor
            height={400}
            id={publishType}
            schema={getSchema()}
            value={currentConfig || importConfig}
            onChange={(value) => {
              setEditorError(false);
              setImportConfig(value);
            }}
            onError={() => {
              setEditorError(true);
            }}
          />
        )}
      </div>
      <div
        style={{
          flex: 'auto',
          flexGrow: 0,
          background: '#FFFFFF',
          borderTop: '1px solid #EDEBE9',
          width: '100%',
          textAlign: 'right',
          height: 'fit-content',
          padding: '24px 0px 0px',
        }}
      >
        {PageFooter}
      </div>
      <ProvisionHandoff
        developerInstructions={formatMessage('Send this to your IT admin')}
        handoffInstructions={handoffInstructions}
        hidden={!showHandoff}
        title={formatMessage('Generate a provisioning request')}
        onDismiss={() => {
          closeDialog();
          setShowHandoff(false);
        }}
      />
    </div>
  );
};
