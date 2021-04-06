// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import * as React from 'react';
import formatMessage from 'format-message';
import styled from '@emotion/styled';
import { useState, useMemo, useEffect, Fragment, useCallback, useRef } from 'react';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { logOut, usePublishApi, getTenants, getARMTokenForTenant, useLocalStorage } from '@bfc/extension-client';
import { Subscription } from '@azure/arm-subscriptions/esm/models';
import { DeployLocation, AzureTenant } from '@botframework-composer/types';
import { FluentTheme, NeutralColors } from '@uifabric/fluent-theme';
import { LoadingSpinner, ProvisionHandoff } from '@bfc/ui-shared';
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

type ProvisionFormData = {
  creationType: string;
  tenantId: string;
  subscriptionId: string;
  resourceGroup: string;
  hostname: string;
  region: string;
  luisLocation: string;
  enabledResources: ResourcesItem[];
  requiredResources: ResourcesItem[];
};

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

const getHostname = (config) => {
  if (config?.hostname) {
    return config.hostname;
  } else if (config?.name) {
    return config?.environment ? `${config.name}-${config.environment}` : config.name;
  }
};

const getDefaultFormData = (currentProfile, defaults) => {
  return {
    creationType: defaults.creationType ?? 'create',
    tenantId: currentProfile?.tenantId,
    subscriptionId: currentProfile?.subscriptionId ?? defaults.subscriptionId,
    resourceGroup: currentProfile?.resourceGroup ?? defaults.resourceGroup,
    hostname: getHostname(currentProfile) ?? defaults.hostname,
    region: currentProfile?.region ?? defaults.region,
    luisLocation: currentProfile?.settings?.luis?.region ?? defaults.luisLocation,
    enabledResources: defaults.enabledResources ?? [],
    requiredResources: defaults.requireResources ?? [],
  };
};

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
    userShouldProvideTokens,
    getTenantIdFromCache,
    setTenantId,
  } = usePublishApi();

  const { setItem, getItem, clearAll } = useLocalStorage();
  // set type of publish - azurePublish or azureFunctionsPublish
  const publishType = getType();
  const profileName = getName();
  const currentConfig = removePlaceholder(publishConfig);
  const extensionState = { ...defaultExtensionState, ...getItem(profileName) };

  const [token, setToken] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [currentUser, setCurrentUser] = useState<any>(undefined);

  // form options
  const [allTenants, setAllTenants] = useState<AzureTenant[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[] | undefined>();
  const [subscriptionsErrorMessage, setSubscriptionsErrorMessage] = useState<string>();
  const [deployLocations, setDeployLocations] = useState<DeployLocation[]>([]);
  const [luisLocations, setLuisLocations] = useState<DeployLocation[]>([]);
  const [extensionResourceOptions, setExtensionResourceOptions] = useState<ResourcesItem[]>([]);

  const [formData, setFormData] = useState<ProvisionFormData>(getDefaultFormData(currentConfig, extensionState));

  // null = loading
  const [loginErrorMsg, setLoginErrorMsg] = useState<string>('');

  const [resourceGroups, setResourceGroups] = useState<ResourceGroup[]>();
  const [isNewResourceGroupName, setIsNewResourceGroupName] = useState<boolean>(true);
  const [errorResourceGroupName, setErrorResourceGroupName] = useState<string>();
  const [errorHostName, setErrorHostName] = useState('');

  const [isEditorError, setEditorError] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      formData.subscriptionId ?? '<YOUR SUBSCRIPTION ID>'
    } --name ${formData.hostname ?? '<RESOURCE NAME>'}
    --appPassword=<16 CHAR PASSWORD>
    --location=${formData.region || 'westus'}
    --resourceGroup=${formData.resourceGroup || '<RESOURCE GROUP NAME>'}
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

  function updateFormData<K extends keyof ProvisionFormData>(field: K, value: ProvisionFormData[K]) {
    setFormData((current) => ({ ...current, [field]: value }));
  }

  useEffect(() => {
    const selectedResources = formData.requiredResources.concat(formData.enabledResources);
    updateHandoffInstructions(selectedResources);
  }, [formData.enabledResources]);

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
        setLoginErrorMsg(undefined);
      })
      .catch((err) => {
        setTenantId(undefined);
        setCurrentUser(undefined);
        setLoginErrorMsg(err.message || err.toString());
      });
  };

  useEffect(() => {
    setPage(PageTypes.ConfigProvision);
    // TODO: need to get the tenant id from the auth config when running as web app,
    // for electron we will always fetch tenants.
    if (userShouldProvideTokens()) {
      const { accessToken } = getTokenFromCache();

      setToken(accessToken);
      // decode token
      const decoded = decodeToken(accessToken);
      if (decoded) {
        updateFormData('tenantId', decoded.tid);
        setCurrentUser({
          token: accessToken,
          email: decoded.upn,
          name: decoded.name,
          expiration: (decoded.exp || 0) * 1000, // convert to ms,
          sessionExpired: false,
        });
        setPage(PageTypes.ConfigProvision);
        setTitle(DialogTitle.CONFIG_RESOURCES);
        setLoginErrorMsg(undefined);
      }
    } else {
      getTenants().then((tenants) => {
        if (isMounted.current) {
          setAllTenants(tenants);
          if (!getTenantIdFromCache()) {
            if (tenants?.length > 0) {
              // seed tenant selection with 1st tenant
              updateFormData('tenantId', tenants[0].tenantId);
            }
          } else {
            updateFormData('tenantId', getTenantIdFromCache());
          }
        }
      });
    }
  }, []);

  useEffect(() => {
    if (formData.tenantId) {
      if (formData.tenantId !== currentConfig?.tenantId) {
        // reset form data when tenant id changes
        setFormData((current) => ({
          ...current,
          subscriptionId: '',
          resourceGroup: '',
          hostname: '',
          region: '',
          luisLocation: '',
        }));
      }

      getTokenForTenant(formData.tenantId);
    }
  }, [formData.tenantId]);

  const getResources = async () => {
    try {
      if (isMounted.current) {
        const resources = await getResourceList(currentProjectId(), publishType);
        setExtensionResourceOptions(resources);
      }
    } catch (err) {
      // todo: how do we handle API errors in this component
      // eslint-disable-next-line no-console
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
    if (token && formData.subscriptionId) {
      try {
        const resourceGroups = await getResourceGroups(token, formData.subscriptionId);
        if (isMounted.current) {
          setResourceGroups(resourceGroups);

          // After the resource groups load, isNewResourceGroupName can be determined
          setIsNewResourceGroupName(!resourceGroups?.some((r) => r.name === formData.resourceGroup));
        }
      } catch (err) {
        // todo: how do we handle API errors in this component
        // eslint-disable-next-line no-console
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
  }, [token, formData.subscriptionId]);

  const subscriptionOptions = useMemo(() => {
    return subscriptions?.map((t) => ({ key: t.subscriptionId, text: t.displayName }));
  }, [subscriptions]);

  const deployLocationsOption = useMemo((): IDropdownOption[] => {
    return (token && deployLocations?.map((t) => ({ key: t.name, text: t.displayName }))) || [];
  }, [token, deployLocations]);

  const luisLocationsOption = useMemo((): IDropdownOption[] => {
    return (token && luisLocations?.map((t) => ({ key: t.name, text: t.displayName }))) || [];
  }, [token, luisLocations]);

  const checkNameAvailability = useCallback(
    (newName: string) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        if (formData.subscriptionId && publishType === 'azurePublish') {
          // check app name whether exist or not
          CheckWebAppNameAvailability(token, newName, formData.subscriptionId).then((value) => {
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
    [publishType, formData.subscriptionId, token]
  );

  const newHostName = useCallback(
    (e, newName) => {
      updateFormData('hostname', newName);
      // debounce name check
      checkNameAvailability(newName);
    },
    [checkNameAvailability]
  );

  const updateCurrentLocation = useCallback(
    (_e, option?: IDropdownOption) => {
      const location = deployLocations.find((t) => t.name === option?.key);
      if (location) {
        updateFormData('region', location.name);
        const region = luisLocations.find((item) => item.name === location.name);
        if (region) {
          updateFormData('luisLocation', region.name);
        } else {
          updateFormData('luisLocation', luisLocations[0].name);
        }
      }
    },
    [deployLocations, luisLocations]
  );

  useEffect(() => {
    if (formData.subscriptionId && token) {
      // get resource group under subscription
      getDeployLocations(token, formData.subscriptionId).then((data: DeployLocation[]) => {
        if (isMounted.current) {
          setDeployLocations(data);
          const luRegions = getLuisAuthoringRegions();
          const region = data.filter((item) => luRegions.includes(item.name));
          setLuisLocations(region);
        }
      });
    }
  }, [formData.subscriptionId, token]);

  const onNext = useCallback(
    (hostname) => {
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
      const optionalList = result.filter((item) => !item.required);
      updateFormData('requiredResources', requireList);
      updateFormData('enabledResources', optionalList);

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

  const onSave = useCallback(() => {
    savePublishConfig(importConfig);
    clearAll();
    closeDialog();
  }, [importConfig]);

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
    return Boolean(
      !formData.subscriptionId ||
        !formData.resourceGroup ||
        !formData.hostname ||
        !formData.region ||
        subscriptionsErrorMessage ||
        errorResourceGroupName ||
        errorHostName !== ''
    );
  }, [
    formData.subscriptionId,
    formData.resourceGroup,
    formData.hostname,
    formData.region,
    errorResourceGroupName,
    errorHostName,
  ]);

  const isSelectAddResources = useMemo(() => {
    return formData.enabledResources.length > 0 || formData.requiredResources.length > 0;
  }, [formData.enabledResources]);

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
            selectedKey={formData.creationType || 'create'}
            onChange={(_e, option) => {
              updateFormData('creationType', option.key);
            }}
          />
        </div>
        <div style={{ flex: 1, height: '100%' }}>
          {formData.creationType === 'create' && (
            <form style={{ width: '100%' }}>
              <Dropdown
                ariaLabel={formatMessage(
                  'The Azure AD directory includes the tenant’s users, groups, and apps and is used to perform identity and access management functions for tenant resources.'
                )}
                disabled={allTenants.length === 1 || currentConfig?.tenantId}
                errorMessage={loginErrorMsg}
                label={formatMessage('Azure Directory')}
                options={allTenants.map((t) => ({ key: t.tenantId, text: t.displayName }))}
                selectedKey={formData.tenantId}
                styles={{ root: { paddingBottom: '8px' } }}
                onChange={(_e, o) => {
                  updateFormData('tenantId', o.key as string);
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
                selectedKey={formData.subscriptionId}
                styles={{ root: { paddingBottom: '8px' } }}
                onChange={(_e, o) => {
                  updateFormData('subscriptionId', o.key as string);
                }}
                onRenderLabel={onRenderLabel}
              />
              <ResourceGroupPicker
                disabled={currentConfig?.resourceGroup}
                newResourceGroupName={isNewResourceGroupName ? formData.resourceGroup : undefined}
                resourceGroupNames={resourceGroupNames}
                selectedResourceGroupName={isNewResourceGroupName ? undefined : formData.resourceGroup}
                onChange={(choice) => {
                  setIsNewResourceGroupName(choice.isNew);
                  updateFormData('resourceGroup', choice.name);
                  setErrorResourceGroupName(choice.errorMessage);
                }}
              />
              <TextField
                required
                ariaLabel={formatMessage(
                  'This name will be assigned to all your new resources. For eg-test-web app, test-luis-prediction'
                )}
                disabled={currentConfig?.hostname || currentConfig?.name}
                errorMessage={errorHostName}
                label={formatMessage('Resource name')}
                placeholder={formatMessage('Name of your services')}
                styles={{ root: { paddingBottom: '8px' } }}
                value={formData.hostname}
                onChange={newHostName}
                onRenderLabel={onRenderLabel}
              />
              <Dropdown
                required
                disabled={currentConfig?.region}
                label={formatMessage('Region')}
                options={deployLocationsOption}
                placeholder={formatMessage('Select one')}
                selectedKey={formData.region}
                styles={{ root: { paddingBottom: '8px' } }}
                onChange={updateCurrentLocation}
                onRenderLabel={onRenderLabel}
              />
              <Dropdown
                required
                disabled={currentConfig?.settings?.luis?.region}
                label={formatMessage('Region for Luis')}
                options={luisLocationsOption}
                placeholder={formatMessage('Select one')}
                selectedKey={formData.luisLocation}
                onChange={(e, o) => {
                  updateFormData('luisLocation', o.key as string);
                }}
              />
            </form>
          )}
          {formData.creationType === 'import' && (
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
            </div>
          )}
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
      const selectedResourceKeys = formData.enabledResources.map((r) => r.key);

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
                    updateFormData('enabledResources', newSelection);
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
                setItem(profileName, formData);
                onBack();
              }}
            />
            {formData.creationType === 'create' && (
              <PrimaryButton
                disabled={isNextDisabled}
                style={{ margin: '0 4px' }}
                text={formatMessage('Next: Review')}
                onClick={() => {
                  onNext(formData.hostname);
                }}
              />
            )}
            {formData.creationType === 'generate' && (
              <PrimaryButton
                style={{ margin: '0 4px' }}
                text={formatMessage('Generate resource request')}
                onClick={() => onNext(formData.hostname)}
              />
            )}
            {formData.creationType === 'import' && (
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
                if (formData.creationType === 'generate') {
                  setShowHandoff(true);
                } else {
                  setPage(PageTypes.ReviewResource);
                  setTitle(DialogTitle.REVIEW);
                  let selectedResources = formData.requiredResources.concat(formData.enabledResources);
                  selectedResources = selectedResources.map((item) => {
                    let region = currentConfig?.region || formData.region;
                    if (item.key.includes('luis')) {
                      region = formData.luisLocation;
                    }
                    return {
                      ...item,
                      region: region,
                      resourceGroup: currentConfig?.resourceGroup || formData.resourceGroup,
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
                const selectedResources = formData.requiredResources.concat(formData.enabledResources);
                onSubmit({
                  subscription: formData.subscriptionId,
                  resourceGroup: formData.resourceGroup,
                  hostname: formData.hostname,
                  location: formData.region,
                  luisLocation: formData.luisLocation || formData.region,
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
  }, [onSave, page, formData, isEditorError, isNextDisabled, publishType, extensionResourceOptions, currentUser]);

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
    <Fragment>
      <ProvisionHandoff
        developerInstructions={formatMessage('Send this to your IT admin')}
        handoffInstructions={handoffInstructions}
        hidden={!showHandoff}
        title={formatMessage('Generate a provisioning request')}
        onBack={() => {
          setShowHandoff(false);
        }}
        onDismiss={() => {
          closeDialog();
        }}
      />
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
      </div>
    </Fragment>
  );
};
