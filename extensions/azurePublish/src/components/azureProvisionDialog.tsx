// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import * as React from 'react';
import formatMessage from 'format-message';
import styled from '@emotion/styled';
import { useState, useMemo, useEffect, Fragment, useCallback, useRef } from 'react';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import {
  logOut,
  usePublishApi,
  useProjectApi,
  getTenants,
  getARMTokenForTenant,
  useLocalStorage,
  useTelemetryClient,
  useApplicationApi,
} from '@bfc/extension-client';
import { Subscription } from '@azure/arm-subscriptions/esm/models';
import { DeployLocation, AzureTenant, Notification } from '@botframework-composer/types';
import { FluentTheme, NeutralColors } from '@uifabric/fluent-theme';
import { LoadingSpinner, OpenConfirmModal, ProvisionHandoff } from '@bfc/ui-shared';
import {
  ScrollablePane,
  ScrollbarVisibility,
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
  FontWeights,
  FontSizes,
  Label,
  IStackTokens,
  IStackItemStyles,
  Link,
  ChoiceGroup,
  IChoiceGroupOption,
} from 'office-ui-fabric-react';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { JsonEditor } from '@bfc/code-editor';
import { ResourceGroup } from '@azure/arm-resources/esm/models';
import sortBy from 'lodash/sortBy';

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
import { getExistResources, removePlaceholder, decodeToken, defaultExtensionState, parseRuntimeKey } from './util';
import { ResourceGroupPicker } from './ResourceGroupPicker';
import { ChooseProvisionAction } from './ChooseProvisionAction';

type ProvisionFormData = {
  creationType: string;
  tenantId: string;
  subscriptionId: string;
  resourceGroup: string;
  hostname: string;
  region: string;
  luisLocation: string;
  appServiceOperatingSystem: string;
  enabledResources: ResourcesItem[];
  requiredResources: ResourcesItem[];
};

// ---------- Styles ---------- //
type ProvisonActionsStylingProps = {
  showSignout: boolean;
};
const AddResourcesSectionName = styled(Text)`
  font-size: ${FluentTheme.fonts.mediumPlus.fontSize};
`;

const ProvisonActions = styled.div<ProvisonActionsStylingProps>((props) => ({
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: props.showSignout ? 'space-between' : 'flex-end',
}));

const ConfigureResourcesSectionName = styled(Text)`
  font-size: ${FluentTheme.fonts.mediumPlus.fontSize};
  font-weight: ${FontWeights.semibold};
  margin-bottom: 4px;
`;

const ConfigureResourcesSectionDescription = styled(Text)`
  font-size: ${FluentTheme.fonts.medium.fontSize};
  line-height: ${FontSizes.size14};
  margin-bottom: 20px;
`;

const configureResourcePropertyStackTokens: IStackTokens = { childrenGap: 5 };

const configureResourcePropertyLabelStackStyles: IStackItemStyles = {
  root: {
    width: '200px',
  },
};

const ConfigureResourcesPropertyLabel = styled(Label)`
  font-size: ${FluentTheme.fonts.medium.fontSize};
  font-weight: ${FontWeights.regular};
`;

const configureResourceDropdownStyles = { root: { paddingBottom: '4px', width: '300px' } };

const configureResourceTextFieldStyles = { root: { paddingBottom: '4px', width: '300px' } };

const configureResourcesIconStyle = {
  root: {
    color: NeutralColors.gray160,
    userSelect: 'none',
  },
};

const LearnMoreLink = styled(Link)`
  user-select: none;
  font-size: 14px;
`;

const appOSChoiceGroupStyles = {
  flexContainer: { display: 'flex', flexDirection: 'row', alignItems: 'center' },
};

const PageTypes = {
  ChooseAction: 'chooseAction',
  ConfigProvision: 'config',
  AddResources: 'add',
  ReviewResource: 'review',
  EditJson: 'edit',
};

const DialogTitle = {
  CHOOSE_ACTION: {
    title: formatMessage('Configure resources to your publishing profile'),
    subText: formatMessage('How would you like to provision Azure resources to your publishing profile?'),
  },
  EDIT: {
    title: formatMessage('Import existing resources'),
    subText: formatMessage('Please provide your Publish Configuration'),
  },
  ADD_RESOURCES: {
    title: formatMessage('Add resources'),

    subText: formatMessage.rich(
      'Your bot needs the following resources based on its capabilities. Select resources that you want to provision in your publishing profile. <a>Learn more</a>',
      {
        a: ({ children }) => (
          <a
            key="add-resource-learn-more"
            href={'https://aka.ms/composer-publish-bot#create-new-azure-resources'}
            rel="noopener noreferrer"
            target="_blank"
          >
            {children}
          </a>
        ),
      }
    ),
  },
  REVIEW: {
    title: formatMessage('Review resources to be created'),
    subText: formatMessage(
      'The following resources will be created and provisioned for your bot. Once provisioned, they will be available in the Azure portal.'
    ),
  },
  CONFIG_RESOURCES: {
    title: formatMessage('Configure resources'),
    subText: '',
  },
};

const getResourceRegion = (item: ResourcesItem): string => {
  const { key, region } = item;
  switch (key) {
    case AzureResourceTypes.APP_REGISTRATION:
    case AzureResourceTypes.BOT_REGISTRATION:
      return 'global';
    default:
      return region;
  }
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
          {getResourceRegion(item)}
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

const getLogoutNotificationSettings = (description: string, type: Notification['type']) => {
  return {
    title: '',
    retentionTime: 5000,
    description: description,
    type,
    onRenderCardContent: (props) => (
      <div style={{ padding: '0 16px 16px 16px', fontSize: '12px' }}>{props.description}</div>
    ),
  };
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
    appServiceOperatingSystem:
      currentProfile?.settings?.appServiceOperatingSystem ?? defaults.appServiceOperatingSystem,
    enabledResources: defaults.enabledResources ?? [],
    requiredResources: defaults.requireResources ?? [],
  };
};

export const AzureProvisionDialog: React.FC = () => {
  const {
    currentProjectId: getCurrentProjectId,
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

  const { projectCollection } = useProjectApi();

  const currentProjectId = getCurrentProjectId();

  const telemetryClient = useTelemetryClient();

  const { setItem, getItem, clearAll } = useLocalStorage();
  // set type of publish - azurePublish or azureFunctionsPublish
  const publishType = getType();
  const profileName = getName();

  const getPreferredAppServiceOS = () => {
    const project = projectCollection.find((project) => project.projectId === currentProjectId);
    const runtimeKey = project?.setting.runtime.key;
    if (runtimeKey) {
      const { runtimeLanguage, runtimeType } = parseRuntimeKey(runtimeKey);

      switch (runtimeLanguage) {
        case 'dotnet':
          return 'windows';
        case 'js':
          switch (runtimeType) {
            case 'webapp':
              return 'linux';
            case 'function':
              return 'windows';
            default:
              return 'windows';
          }
          break;
        default:
          return 'windows';
      }
    } else {
      return 'windows';
    }
  };

  const currentConfig = removePlaceholder(publishConfig);
  const extensionState = { ...defaultExtensionState, ...getItem(profileName) };

  const [token, setToken] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [currentUser, setCurrentUser] = useState<any>(undefined);

  // form options
  const [allTenants, setAllTenants] = useState<AzureTenant[]>([]);
  const [tenantsErrorMessage, setTenantsErrorMessage] = useState<string>('');
  const [subscriptions, setSubscriptions] = useState<Subscription[] | undefined>();
  const [subscriptionsErrorMessage, setSubscriptionsErrorMessage] = useState<string>();
  const [deployLocations, setDeployLocations] = useState<DeployLocation[]>([]);
  const [luisLocations, setLuisLocations] = useState<DeployLocation[]>([]);
  const [extensionResourceOptions, setExtensionResourceOptions] = useState<ResourcesItem[]>([]);

  const preferredAppServiceOS = useMemo(getPreferredAppServiceOS, [currentProjectId, projectCollection]);
  const [formData, setFormData] = useState<ProvisionFormData>(
    getDefaultFormData(currentConfig, { ...extensionState, appServiceOperatingSystem: preferredAppServiceOS })
  );

  const [isLoading, setIsLoading] = useState(true);
  const [loadingErrorMessage, setLoadingErrorMessage] = useState<string>();

  const [resourceGroups, setResourceGroups] = useState<ResourceGroup[]>();
  const [isNewResourceGroup, setIsNewResourceGroup] = useState(!currentConfig?.resourceGroup);
  const [errorResourceGroupName, setErrorResourceGroupName] = useState<string>();

  const [errorHostName, setErrorHostName] = useState('');

  const [isEditorError, setEditorError] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [importConfig, setImportConfig] = useState<any>();

  const [page, setPage] = useState<string>(PageTypes.ChooseAction);
  const [listItems, setListItems] = useState<(ResourcesItem & { icon?: string })[]>();
  const [reviewListItems, setReviewListItems] = useState<ResourcesItem[]>([]);
  const isMounted = useRef<boolean>();

  const timerRef = useRef<NodeJS.Timeout>();

  const [handoffInstructions, setHandoffInstructions] = useState<string>('');
  const [showHandoff, setShowHandoff] = useState<boolean>(false);
  const { addNotification } = useApplicationApi();
  const updateHandoffInstructions = (resources) => {
    const createLuisResource = resources.filter((r) => r.key === 'luisPrediction').length > 0;
    const createLuisAuthoringResource = resources.filter((r) => r.key === 'luisAuthoring').length > 0;
    const createCosmosDb = resources.filter((r) => r.key === 'cosmosDb').length > 0;
    const createStorage = resources.filter((r) => r.key === 'blobStorage').length > 0;
    const createAppInsights = resources.filter((r) => r.key === 'applicationInsights').length > 0;
    const createQnAResource = resources.filter((r) => r.key === 'qna').length > 0;

    const provisionComposer = `node provisionComposer.js --subscriptionId ${
      formData.subscriptionId || '<YOUR SUBSCRIPTION ID>'
    } --name ${formData.hostname || '<RESOURCE NAME>'} --appPassword=<16 CHAR PASSWORD> --location=${
      formData.region || 'westus'
    } --resourceGroup=${
      formData.resourceGroup || '<RESOURCE GROUP NAME>'
    } --createLuisResource=${createLuisResource} --createLuisAuthoringResource=${createLuisAuthoringResource} --createCosmosDb=${createCosmosDb} --createStorage=${createStorage} --createAppInsights=${createAppInsights} --createQnAResource=${createQnAResource}`;

    const instructions = formatMessage(
      'I am creating a conversational experience using Microsoft Bot Framework project.' +
        ' For my project to work, Azure resources, including app registration, hosting, channels, Language Understanding, and QnA Maker, are required.' +
        ' Below are the steps to create these resources.\n\n' +
        '1. Follow the instructions at the link below to run the provisioning command (seen below)\n' +
        '2. Copy and paste the resulting JSON and securely share it with me.\n\n' +
        'Provisoning Command:\n' +
        '{command}\n\n' +
        'Detailed instructions:\nhttps://aka.ms/how-to-complete-provision-handoff',
      { command: provisionComposer }
    );

    setHandoffInstructions(instructions);
  };

  const setPageAndTitle = (page: string) => {
    setPage(page);
    switch (page) {
      case PageTypes.AddResources:
        telemetryClient?.track('ProvisionAddResourcesNavigate');
        setTitle(DialogTitle.ADD_RESOURCES);
        break;
      case PageTypes.ChooseAction:
        setTitle(DialogTitle.CHOOSE_ACTION);
        break;
      case PageTypes.ConfigProvision:
        telemetryClient?.track('ProvisionConfigureResources');
        setTitle(DialogTitle.CONFIG_RESOURCES);
        break;
      case PageTypes.EditJson:
        telemetryClient?.track('ProvisionEditJSON');
        setTitle(DialogTitle.EDIT);
        break;
      case PageTypes.ReviewResource:
        telemetryClient?.track('ProvisionReviewResources');
        setTitle(DialogTitle.REVIEW);
        break;
    }
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

  useEffect(() => {
    setPage(PageTypes.ChooseAction);
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
        setPageAndTitle(PageTypes.ChooseAction);
      } else {
        setLoadingErrorMessage(
          formatMessage(
            'There was a problem with the authentication access token. Close this dialog and try again. To be prompted to provide the access token again, clear it from application local storage.'
          )
        );
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (page === PageTypes.ConfigProvision) {
      if (!userShouldProvideTokens()) {
        // TODO: handle when existing profile is being edited
        // We should get an ARM token for the tenant in the profile and then fetch tenant details after to show in the UI.
        // Note: For electron, getTenants may cause the sign-in dialog to appear.
        getTenants()
          .then((tenants) => {
            if (isMounted.current) {
              setAllTenants(tenants);

              if (tenants.length === 0) {
                setTenantsErrorMessage(formatMessage('No Azure Directories were found.'));
              } else {
                setTenantsErrorMessage(undefined);
              }

              const cachedTenantId = getTenantIdFromCache();

              // default to the last used tenant only if it is in the account's tenants
              if (cachedTenantId && tenants.map((t) => t.tenantId).includes(cachedTenantId)) {
                updateFormData('tenantId', cachedTenantId);
              } else {
                setTenantId(undefined);
                if (tenants?.length > 0) {
                  // seed tenant selection with 1st tenant
                  updateFormData('tenantId', tenants[0].tenantId);
                }
              }
            }
          })
          .catch((err) => {
            setTenantsErrorMessage(
              formatMessage('There was a problem loading Azure directories. {errMessage}', {
                errMessage: err.message || err.toString(),
              })
            );
          });
      }
    }
  }, [page]);

  const getTokenForTenant = (tenantId: string) => {
    getARMTokenForTenant(tenantId)
      .then((token) => {
        // set tenantId in cache only after a token is received
        setTenantId(tenantId);
        setToken(token);
        const decoded = decodeToken(token);
        setCurrentUser({
          token: token,
          email: decoded.upn,
          name: decoded.name,
          expiration: (decoded.exp || 0) * 1000, // convert to ms,
          sessionExpired: false,
        });
        setTenantsErrorMessage(undefined);
      })
      .catch((err) => {
        setTenantId(undefined);
        setCurrentUser(undefined);
        setTenantsErrorMessage(
          formatMessage('There was a problem getting the access token for the current Azure directory. {errMessage}', {
            errMessage: err.message || err.toString(),
          })
        );
        setTenantsErrorMessage(err.message || err.toString());
      });
  };

  useEffect(() => {
    if (formData.tenantId && page === PageTypes.ConfigProvision) {
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

      if (!userShouldProvideTokens()) {
        getTokenForTenant(formData.tenantId);
      }
    }
  }, [formData.tenantId, page]);

  const getResources = async () => {
    try {
      const resources = await getResourceList(currentProjectId, publishType);
      setExtensionResourceOptions(resources);
    } catch (err) {
      // todo: how do we handle API errors in this component
      // eslint-disable-next-line no-console
      console.log('ERROR', err);
    }
  };

  useEffect(() => {
    getResources();
  }, [publishType]);

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
    }
  }, [token]);

  const loadResourceGroups = async () => {
    if (token && formData.subscriptionId) {
      try {
        const resourceGroups = await getResourceGroups(token, formData.subscriptionId);
        if (isMounted.current) {
          setResourceGroups(resourceGroups);
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

  const deployLocationOptions = useMemo((): IDropdownOption[] => {
    const unorderedDeployLocations =
      (token && deployLocations?.map((t) => ({ key: t.name, text: t.displayName }))) || [];
    return sortBy(unorderedDeployLocations, [(location) => location.text]);
  }, [token, deployLocations]);

  const luisLocationOptions = useMemo((): IDropdownOption[] => {
    const unorderedLuisLocations = (token && luisLocations?.map((t) => ({ key: t.name, text: t.displayName }))) || [];
    return sortBy(unorderedLuisLocations, [(location) => location.text]);
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

  useEffect(() => {
    if (!isNewResourceGroup) {
      const resourceGroupNames = resourceGroups?.map((r) => r.name) || [];
      setIsNewResourceGroup(!currentConfig?.resourceGroup && !resourceGroupNames.includes(formData.resourceGroup));
    }
  }, [currentConfig, formData.resourceGroup, resourceGroups]);

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

      setPageAndTitle(PageTypes.AddResources);
    },
    [extensionResourceOptions]
  );

  const onSubmit = useCallback((options) => {
    // call back to the main Composer API to begin this process...

    telemetryClient?.track('ProvisionStart', {
      region: options.location,
      subscriptionId: options.subscription,
      externalResources: options.externalResources,
    });

    startProvision(options);
    clearAll();
    closeDialog();
  }, []);

  const onSave = useCallback(() => {
    savePublishConfig(removePlaceholder(importConfig));
    clearAll();
    closeDialog();
  }, [importConfig]);

  const signoutAndNotify = useCallback(async () => {
    const isSignedOut = await logOut();
    if (isSignedOut) {
      addNotification(
        getLogoutNotificationSettings(formatMessage('You have successfully signed out of Azure'), 'info')
      );
      closeDialog();
    } else {
      addNotification(
        getLogoutNotificationSettings(
          formatMessage(
            'There was an error attempting to sign out of Azure. To complete sign out, you may need to restart Composer.'
          ),
          'error'
        )
      );
    }
  }, [addNotification]);

  const onRenderSecondaryText = useMemo(
    () => (props: IPersonaProps) => {
      return (
        <div
          role="button"
          style={{ color: 'blue', cursor: 'pointer' }}
          onClick={async () => {
            const confirmed = await OpenConfirmModal(
              formatMessage('Sign out of Azure'),
              formatMessage(
                'By signing out of Azure, your new publishing profile will be canceled and this dialog will close. Do you want to continue?'
              ),
              {
                onRenderContent: (subtitle: string) => <div>{subtitle}</div>,
                confirmText: formatMessage('Sign out'),
                cancelText: formatMessage('Cancel'),
              }
            );
            if (confirmed) {
              await signoutAndNotify();
            }
          }}
        >
          {props.secondaryText}
        </div>
      );
    },
    [signoutAndNotify]
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

  const PageChooseAction = (
    <div style={{ height: 'calc(100vh - 65px)' }}>
      <ChooseProvisionAction
        choice={formData.creationType}
        onChoiceChanged={(choice) => {
          updateFormData('creationType', choice);
        }}
      />
    </div>
  );

  const renderPropertyInfoIcon = (tooltip: string) => {
    return (
      <TooltipHost content={tooltip}>
        <Icon iconName="Unknown" styles={configureResourcesIconStyle} />
      </TooltipHost>
    );
  };

  const getAppServiceOSOptions = useCallback((): IChoiceGroupOption[] => {
    return [
      {
        key: 'windows',
        text: preferredAppServiceOS === 'windows' ? formatMessage('Windows (Recommended)') : formatMessage('Windows'),
        styles: {
          root: { marginTop: '4px' },
        },
      },
      {
        key: 'linux',
        text: preferredAppServiceOS === 'linux' ? formatMessage('Linux (Recommended)') : formatMessage('Linux'),
        styles: {
          root: { marginTop: '4px', marginLeft: '8px' },
        },
      },
    ];
  }, [preferredAppServiceOS]);

  const PageFormConfig = (
    <ScrollablePane
      data-is-scrollable="true"
      scrollbarVisibility={ScrollbarVisibility.auto}
      style={{ height: 'calc(100vh - 65px)' }}
    >
      <form style={{ width: '100%' }}>
        <Stack>
          <ConfigureResourcesSectionName>{formatMessage('Azure details')}</ConfigureResourcesSectionName>
          <ConfigureResourcesSectionDescription>
            {formatMessage('Select your Azure directory and subscription, enter resource group name.')}
          </ConfigureResourcesSectionDescription>
          <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
            <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
              <ConfigureResourcesPropertyLabel required>
                {formatMessage('Azure Directory')}
              </ConfigureResourcesPropertyLabel>
              {renderPropertyInfoIcon(
                formatMessage(
                  'Azure Active Directory is Microsoft’s cloud-based identity and access management service.'
                )
              )}
            </Stack>
            <Dropdown
              disabled={allTenants.length === 1 || currentConfig?.tenantId}
              errorMessage={tenantsErrorMessage}
              options={allTenants.map((t) => ({ key: t.tenantId, text: t.displayName }))}
              selectedKey={formData.tenantId}
              styles={configureResourceDropdownStyles}
              onChange={(_e, o) => {
                updateFormData('tenantId', o.key as string);
              }}
            />
          </Stack>
          <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
            <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
              <ConfigureResourcesPropertyLabel required>
                {formatMessage('Subscription')}
              </ConfigureResourcesPropertyLabel>
              {renderPropertyInfoIcon(formatMessage('The subscription that will be billed for the resources.'))}
            </Stack>
            <Dropdown
              disabled={currentConfig?.subscriptionId}
              errorMessage={subscriptionsErrorMessage}
              options={subscriptionOptions}
              placeholder={formatMessage('Select one')}
              selectedKey={formData.subscriptionId}
              styles={configureResourceDropdownStyles}
              onChange={(_e, o) => {
                updateFormData('subscriptionId', o.key as string);
              }}
            />
          </Stack>
          <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
            <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
              <ConfigureResourcesPropertyLabel required>
                {formatMessage('Resource group')}
              </ConfigureResourcesPropertyLabel>
              {renderPropertyInfoIcon(
                formatMessage(
                  'A custom resource group name that you choose or create. Resource groups allow you to group Azure resources for access and management.'
                )
              )}
            </Stack>
            <ResourceGroupPicker
              disabled={currentConfig?.resourceGroup}
              newResourceGroupName={isNewResourceGroup ? formData.resourceGroup : undefined}
              resourceGroupNames={resourceGroupNames}
              selectedResourceGroupName={isNewResourceGroup ? undefined : formData.resourceGroup}
              onChange={(choice) => {
                setIsNewResourceGroup(choice.isNew);
                updateFormData('resourceGroup', choice.name);
                setErrorResourceGroupName(choice.errorMessage);
              }}
            />
          </Stack>
          <ConfigureResourcesSectionName>
            {formatMessage('App Service (Web App or Function)')}
          </ConfigureResourcesSectionName>
          <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
            <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
              <ConfigureResourcesPropertyLabel required>
                {formatMessage('Operating System')}
              </ConfigureResourcesPropertyLabel>
              {renderPropertyInfoIcon(
                formatMessage('Select the operating system that will host your application service.')
              )}
            </Stack>
            <ChoiceGroup
              required
              options={getAppServiceOSOptions()}
              selectedKey={formData.appServiceOperatingSystem}
              styles={appOSChoiceGroupStyles}
              onChange={(_e, o) => {
                updateFormData('appServiceOperatingSystem', o.key as string);
              }}
            />
          </Stack>
          <ConfigureResourcesSectionName>{formatMessage('Resource details')}</ConfigureResourcesSectionName>
          <ConfigureResourcesSectionDescription>
            {formatMessage('Enter resource name and select region. This will be applied to the new resources.')}
          </ConfigureResourcesSectionDescription>
          <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
            <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
              <ConfigureResourcesPropertyLabel required>{formatMessage('Name')}</ConfigureResourcesPropertyLabel>
              {renderPropertyInfoIcon(formatMessage('A unique name for your resources.'))}
            </Stack>
            <TextField
              disabled={currentConfig?.hostname || currentConfig?.name}
              errorMessage={errorHostName}
              placeholder={formatMessage('New resource name')}
              styles={configureResourceTextFieldStyles}
              value={formData.hostname}
              onChange={newHostName}
            />
          </Stack>
          <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
            <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
              <ConfigureResourcesPropertyLabel required>{formatMessage('Region')}</ConfigureResourcesPropertyLabel>
              {renderPropertyInfoIcon(formatMessage('The region where your resources and bot will be used.'))}
            </Stack>
            <Dropdown
              disabled={currentConfig?.region}
              options={deployLocationOptions}
              placeholder={formatMessage('Select one')}
              selectedKey={formData.region}
              styles={configureResourceDropdownStyles}
              onChange={updateCurrentLocation}
            />
          </Stack>
          <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
            <Stack>
              <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
                <ConfigureResourcesPropertyLabel required>
                  {formatMessage('LUIS region')}
                </ConfigureResourcesPropertyLabel>
                {renderPropertyInfoIcon(formatMessage('The region associated with your Language understanding model.'))}
              </Stack>
              <LearnMoreLink
                href="https://docs.microsoft.com/en-us/azure/cognitive-services/luis/luis-reference-regions"
                target="_blank"
              >
                {formatMessage('Learn more')}
              </LearnMoreLink>
            </Stack>
            <Dropdown
              disabled={currentConfig?.settings?.luis?.region}
              options={luisLocationOptions}
              placeholder={formatMessage('Select one')}
              selectedKey={formData.luisLocation}
              styles={configureResourceDropdownStyles}
              onChange={(e, o) => {
                updateFormData('luisLocation', o.key as string);
              }}
            />
          </Stack>
        </Stack>
      </form>
    </ScrollablePane>
  );

  useEffect(() => {
    if (listItems?.length === 0) {
      setPageAndTitle(PageTypes.EditJson);
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
          style={{ height: 'calc(100vh - 65px)' }}
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
      <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto} style={{ height: 'calc(100vh - 65px)' }}>
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
    const isSignedInAndCreateCreationType = currentUser && formData.creationType === 'create';
    if (page === PageTypes.ChooseAction) {
      return (
        <ProvisonActions showSignout={isSignedInAndCreateCreationType}>
          {isSignedInAndCreateCreationType ? (
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
                clearAll();
                setItem(profileName, formData);
                onBack();
              }}
            />
            <PrimaryButton
              disabled={!formData.creationType}
              style={{ margin: '0 4px' }}
              text={formatMessage('Next')}
              onClick={() => {
                switch (formData.creationType) {
                  case 'import':
                    setPageAndTitle(PageTypes.EditJson);
                    break;
                  case 'generate':
                    onNext(formData.hostname);
                    break;
                  case 'create':
                  default:
                    setPageAndTitle(PageTypes.ConfigProvision);
                    break;
                }
              }}
            />
            <DefaultButton
              style={{ margin: '0 4px' }}
              text={formatMessage('Cancel')}
              onClick={() => {
                telemetryClient?.track('ProvisionCancel');
                closeDialog();
              }}
            />
          </div>
        </ProvisonActions>
      );
    } else if (page === PageTypes.ConfigProvision) {
      return (
        <ProvisonActions showSignout={isSignedInAndCreateCreationType}>
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
                clearAll();
                setItem(profileName, formData);
                setPageAndTitle(PageTypes.ChooseAction);
              }}
            />
            {formData.creationType === 'create' && (
              <PrimaryButton
                disabled={isNextDisabled}
                style={{ margin: '0 4px' }}
                text={formatMessage('Next')}
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
            <DefaultButton
              style={{ margin: '0 4px' }}
              text={formatMessage('Cancel')}
              onClick={() => {
                closeDialog();
              }}
            />
          </div>
        </ProvisonActions>
      );
    } else if (page === PageTypes.AddResources) {
      return (
        <ProvisonActions showSignout={isSignedInAndCreateCreationType}>
          {isSignedInAndCreateCreationType ? (
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
                if (formData.creationType === 'generate') {
                  setPageAndTitle(PageTypes.ChooseAction);
                } else {
                  setPageAndTitle(PageTypes.ConfigProvision);
                }
              }}
            />
            <PrimaryButton
              disabled={!isSelectAddResources}
              style={{ margin: '0 4px' }}
              text={formatMessage('Next')}
              onClick={() => {
                if (formData.creationType === 'generate') {
                  telemetryClient?.track('ProvisionShowHandoff');
                  setShowHandoff(true);
                } else {
                  setPageAndTitle(PageTypes.ReviewResource);
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
            <DefaultButton
              style={{ margin: '0 4px' }}
              text={formatMessage('Cancel')}
              onClick={() => {
                telemetryClient?.track('ProvisionAddResourcesCancel');
                closeDialog();
              }}
            />
          </div>
        </ProvisonActions>
      );
    } else if (page === PageTypes.ReviewResource) {
      return (
        <ProvisonActions showSignout={isSignedInAndCreateCreationType}>
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
                setPageAndTitle(PageTypes.AddResources);
              }}
            />
            <PrimaryButton
              disabled={isNextDisabled}
              style={{ margin: '0 4px' }}
              text={formatMessage('Create')}
              onClick={() => {
                const selectedResources = formData.requiredResources.concat(formData.enabledResources);
                telemetryClient?.track('CreateProvisionStarted', { newResourceGroup: isNewResourceGroup });
                onSubmit({
                  tenantId: formData.tenantId,
                  subscription: formData.subscriptionId,
                  resourceGroup: formData.resourceGroup,
                  hostname: formData.hostname,
                  location: formData.region,
                  luisLocation: formData.luisLocation || formData.region,
                  appServiceOperatingSystem: formData.appServiceOperatingSystem,
                  type: publishType,
                  externalResources: selectedResources,
                });
              }}
            />
            <DefaultButton
              style={{ margin: '0 4px' }}
              text={formatMessage('Cancel')}
              onClick={() => {
                closeDialog();
              }}
            />
          </div>
        </ProvisonActions>
      );
    } else {
      return (
        <>
          <DefaultButton
            style={{ margin: '0 4px' }}
            text={formatMessage('Back')}
            onClick={() => {
              setPageAndTitle(PageTypes.ChooseAction);
            }}
          />
          <PrimaryButton
            disabled={isEditorError}
            style={{ margin: '0 4px' }}
            text={formatMessage('Import')}
            onClick={onSave}
          />
          <DefaultButton
            style={{ margin: '0 4px' }}
            text={formatMessage('Cancel')}
            onClick={() => {
              closeDialog();
            }}
          />
        </>
      );
    }
  }, [onSave, page, formData, isEditorError, isNextDisabled, publishType, extensionResourceOptions, currentUser]);

  // if we haven't loaded the token yet, show a loading spinner
  // unless we need to select the tenant first
  if (isLoading) {
    return (
      <div style={{ height: '100vh' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (loadingErrorMessage) {
    return (
      <div style={{ height: '100vh' }}>
        <MessageBar isMultiline messageBarType={MessageBarType.error}>
          {loadingErrorMessage}
        </MessageBar>
      </div>
    );
  }

  return (
    <Fragment>
      <ProvisionHandoff
        developerInstructions={formatMessage(
          'If Azure resources and subscription are managed by others, use the following information to request creation of the resources that you need to build and run your bot.'
        )}
        handoffInstructions={handoffInstructions}
        hidden={!showHandoff}
        learnMoreLink="https://aka.ms/how-to-complete-provision-handoff"
        title={formatMessage('Generate instructions for Azure administrator')}
        onBack={() => {
          setShowHandoff(false);
        }}
        onDismiss={() => {
          closeDialog();
        }}
      />
      <div
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '430px',
        }}
      >
        <div style={{ flex: 1 }}>
          {page === PageTypes.ChooseAction && PageChooseAction}
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
