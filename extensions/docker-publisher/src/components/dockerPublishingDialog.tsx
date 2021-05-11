import * as React from 'react';
import formatMessage from 'format-message';
import styled from '@emotion/styled';
import { FluentTheme, NeutralColors } from '@uifabric/fluent-theme';
import { useState, useMemo, Fragment, useCallback, useEffect, useRef } from 'react';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import {
  FontSizes,
  FontWeights,
  IStackItemStyles,
  IStackTokens,
  ScrollablePane,
  ScrollbarVisibility,
  Stack,
  Text,
  Label,
  TextField,
  TooltipHost,
  Icon,
  Dropdown,
} from 'office-ui-fabric-react';
import {
  logOut,
  usePublishApi,
  getTenants,
  getARMTokenForTenant,
  useLocalStorage,
  useTelemetryClient,
  TelemetryClient,
  useApplicationApi,
} from '@bfc/extension-client';
import { Subscription } from '@azure/arm-subscriptions/esm/models';
import { ResourceGroup, GenericResource } from '@azure/arm-resources/esm/models';
import { AzureDropDownData } from '../types/azureTypes';
import { RegistryFormData, RegistryTypeOptions, PageTypes } from '../types/types';
import { ChooseRegistryAction } from './ChooseRegistryAction';
import { getSubscriptions, getResourceGroups, getResources } from './api';

/// Styles
const ConfigureResourcesSectionDescription = styled(Text)`
  font-size: ${FluentTheme.fonts.medium.fontSize};
  line-height: ${FontSizes.size14};
  margin-bottom: 20px;
`;

const ConfigureResourcesSectionName = styled(Text)`
  font-size: ${FluentTheme.fonts.mediumPlus.fontSize};
  font-weight: ${FontWeights.semibold};
  margin-bottom: 4px;
`;

const configureResourcePropertyStackTokens: IStackTokens = { childrenGap: 5 };

const configureResourcePropertyLabelStackStyles: IStackItemStyles = {
  root: {
    width: '200px',
  },
};

const configureResourcesIconStyle = {
  root: {
    color: NeutralColors.gray160,
    userSelect: 'none',
  },
};

const configureResourceTextFieldStyles = { root: { paddingBottom: '4px', width: '300px' } };

const ConfigureResourcesPropertyLabel = styled(Label)`
  font-size: ${FluentTheme.fonts.medium.fontSize};
  font-weight: ${FontWeights.regular};
`;

const configureResourceDropdownStyles = { root: { paddingBottom: '4px', width: '300px' } };

/// End Styles

export const DockerPublishingDialog: React.FC = () => {
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

  const DialogTitle = {
    REGISTRY: {
      title: formatMessage('Configure Registry'),
      subText: formatMessage('Select your Docker Registry'),
    },
    REGISTRY_CONFIG: {
      title: formatMessage('Configure Registry'),
      subText: formatMessage('Configure your Docker Registry'),
    },
    IMAGE: {
      title: formatMessage('Configure Image'),
      subText: formatMessage('Enter the information regarding Docker Image'),
    },
    REVIEW: {
      title: formatMessage('Review'),
      subText: formatMessage('Review the image information.'),
    },
  };

  const getDefaultFormData = () => {
    return {
      creationType: 'local',
      url: '',
      anonymous: true,
      username: '',
      password: '',
      image: '',
      tag: 'latest',
      subscriptionId: { id: '', text: '' },
      resourceGroup: { id: '', text: '' },
      containerRegistry: { id: '', text: '' },
    };
  };

  const [subscriptions, setSubscriptions] = useState<Subscription[] | undefined>();
  const [resourceGroups, setResourceGroups] = useState<ResourceGroup[] | undefined>();
  const [subscription, setSubscription] = useState<AzureDropDownData | undefined>();
  const [resourceGroup, setResourceGroup] = useState<AzureDropDownData | undefined>();
  const [containerRegistry, setContainerRegistry] = useState<AzureDropDownData | undefined>();

  const [acrs, setACRs] = useState<GenericResource[]>();
  const isMounted = useRef<boolean>();
  const [token, setToken] = useState<string | null>(null);
  const [page, setPage] = useState<string>(PageTypes.RegistryType);
  const [formData, setFormData] = useState<RegistryFormData>(getDefaultFormData());

  const subscriptionOptions = useMemo(() => {
    return subscriptions?.map((t) => ({ key: t.subscriptionId, text: t.displayName }));
  }, [subscriptions]);
  const resourceGroupOptions = useMemo(() => {
    return resourceGroups?.map((t) => ({ key: t.id, text: t.name }));
  }, [resourceGroups]);
  const acrOptions = useMemo(() => {
    return acrs?.map((t) => ({ key: t.id, text: t.name }));
  }, [acrs]);

  const isNextRegistryConfigDisabled = useMemo(() => {
    return Boolean(!formData.url || (formData.anonymous == false ? !formData.username || !formData.password : false));
  }, [formData.url, formData.anonymous, formData.username, formData.password]);
  const isNextACRConfigDisabled = useMemo(() => {
    return Boolean(!subscription?.id || !resourceGroup?.id || !formData.username || !formData.password);
  }, [subscription?.id, resourceGroup?.id, formData.username, formData.password]);

  const isNextImageConfigDisabled = useMemo(() => {
    return Boolean(!formData.image || !formData.tag);
  }, [formData.image, formData.tag]);

  const setPageAndTitle = (page: string) => {
    setPage(page);
    switch (page) {
      case PageTypes.RegistryType:
        setTitle(DialogTitle.REGISTRY);
        break;
      case PageTypes.RegistryConfig:
        setTitle(DialogTitle.REGISTRY_CONFIG);
        break;
      case PageTypes.Image:
        setTitle(DialogTitle.IMAGE);
        break;
      case PageTypes.Review:
        setTitle(DialogTitle.REVIEW);
        break;
    }
  };

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    // TODO: need to get the tenant id from the auth config when running as web app,
    // for electron we will always fetch tenants.
    if (userShouldProvideTokens()) {
      const { accessToken } = getTokenFromCache();
      setToken(accessToken);
    }
  }, []);

  useEffect(() => {
    if (token) {
      getSubscriptions(token)
        .then((data) => {
          if (isMounted.current) {
            setSubscriptions(data);
          }
        })
        .catch((err) => {
          if (isMounted.current) {
            // setSubscriptionsErrorMessage(err.message);
          }
        });
    }
  }, [token]);

  useEffect(() => {
    if (token && subscription?.id && resourceGroup?.id) {
      getResources(token, subscription.id, resourceGroup.text).then((data) => {
        setACRs(data.filter((el) => el.type === 'Microsoft.ContainerRegistry/registries'));
      });
    }
  }, [resourceGroup, resourceGroup?.id]);

  const loadResourceGroups = async () => {
    if (token && subscription?.id) {
      try {
        const resourceGroups = await getResourceGroups(token, subscription.id);
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
  }, [token, subscription?.id]);

  function updateFormData<K extends keyof RegistryFormData>(field: K, value: RegistryFormData[K]) {
    setFormData((current) => ({ ...current, [field]: value }));
  }

  const onSave = useCallback(() => {
    savePublishConfig(formData);
    closeDialog();
  }, [formData]);

  const renderPropertyInfoIcon = (tooltip: string) => {
    return (
      <TooltipHost content={tooltip}>
        <Icon iconName="Unknown" styles={configureResourcesIconStyle} />
      </TooltipHost>
    );
  };

  /// Pages
  const PageRegistry = (
    <div style={{ height: 'calc(100vh - 65px)' }}>
      <ChooseRegistryAction
        choice={formData.creationType}
        onChoiceChanged={(choice) => {
          updateFormData('creationType', choice);
        }}
      />
    </div>
  );

  const PageACRConfig = (
    <ScrollablePane
      data-is-scrollable="true"
      scrollbarVisibility={ScrollbarVisibility.auto}
      style={{ height: 'calc(100vh - 65px)' }}
    >
      <form style={{ width: '100%' }}>
        <Stack>
          <ConfigureResourcesSectionName>{formatMessage('Azure Details')}</ConfigureResourcesSectionName>
          <ConfigureResourcesSectionDescription>
            {formatMessage('Select your subscription, resource group and Azure Container Registry.')}
          </ConfigureResourcesSectionDescription>

          <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
            <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
              <ConfigureResourcesPropertyLabel required>
                {formatMessage('Subscription')}
              </ConfigureResourcesPropertyLabel>
              {renderPropertyInfoIcon(formatMessage('The subscription that will be billed for the resources.'))}
            </Stack>
            <Dropdown
              options={subscriptionOptions}
              placeholder={formatMessage('Select one')}
              selectedKey={subscription?.id}
              styles={configureResourceDropdownStyles}
              onChange={(e, v) => {
                setSubscription({ id: v.key as string, text: v.text });
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
                  'A resource group name that you choose or create. Resource groups allow you to group Azure resources for access and management.'
                )
              )}
            </Stack>
            <Dropdown
              disabled={!subscription?.id}
              options={resourceGroupOptions}
              selectedKey={resourceGroup?.id}
              styles={configureResourceDropdownStyles}
              onChange={(e, v) => {
                setResourceGroup({ id: v.key as string, text: v.text });
              }}
            />
          </Stack>
          <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
            <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
              <ConfigureResourcesPropertyLabel required>
                {formatMessage('Container Registry')}
              </ConfigureResourcesPropertyLabel>
              {renderPropertyInfoIcon(formatMessage('The Azure Container Registry Instance to publish the image.'))}
            </Stack>
            <Dropdown
              disabled={!resourceGroup?.id}
              options={acrOptions}
              selectedKey={containerRegistry?.id}
              styles={configureResourceDropdownStyles}
              onChange={(e, v) => {
                setContainerRegistry({ id: v.key as string, text: v.text });
                updateFormData('url', `${v.text}.azurecr.io`);
              }}
            />
          </Stack>

          <ConfigureResourcesSectionName>{formatMessage('Authentication')}</ConfigureResourcesSectionName>
          <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
            <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
              <ConfigureResourcesPropertyLabel required>{formatMessage('Username')}</ConfigureResourcesPropertyLabel>
              {renderPropertyInfoIcon(formatMessage('Registry Username'))}
            </Stack>
            <TextField
              placeholder={formatMessage('Username')}
              styles={configureResourceTextFieldStyles}
              value={formData.username}
              onChange={(e, v) => {
                updateFormData('username', v);
              }}
            />
          </Stack>
          <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
            <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
              <ConfigureResourcesPropertyLabel required>{formatMessage('Password')}</ConfigureResourcesPropertyLabel>
              {renderPropertyInfoIcon(formatMessage('Registry Password'))}
            </Stack>
            <TextField
              styles={configureResourceTextFieldStyles}
              placeholder={formatMessage('Password')}
              type="password"
              value={formData.password}
              onChange={(e, v) => {
                updateFormData('password', v);
              }}
            />
          </Stack>
        </Stack>
      </form>
    </ScrollablePane>
  );

  const PageRegistryConfig = (
    <ScrollablePane
      data-is-scrollable="true"
      scrollbarVisibility={ScrollbarVisibility.auto}
      style={{ height: 'calc(100vh - 65px)' }}
    >
      <form style={{ width: '100%' }}>
        <Stack>
          <ConfigureResourcesSectionName>{formatMessage('Registry Settings')}</ConfigureResourcesSectionName>
          <ConfigureResourcesSectionDescription>
            {formatMessage('Configure your Registry server and authentication.')}
          </ConfigureResourcesSectionDescription>

          <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
            <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
              <ConfigureResourcesPropertyLabel required>
                {formatMessage('Registry URL')}
              </ConfigureResourcesPropertyLabel>
              {renderPropertyInfoIcon(
                formatMessage('The URL of your registry with port number and without http/https')
              )}
            </Stack>
            <TextField
              placeholder={formatMessage('Registry URL')}
              styles={configureResourceTextFieldStyles}
              value={formData.url}
              onChange={(e, v) => {
                updateFormData('url', v);
              }}
            />
          </Stack>

          <ConfigureResourcesSectionName>{formatMessage('Authentication')}</ConfigureResourcesSectionName>
          <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
            <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
              <ConfigureResourcesPropertyLabel required>
                {formatMessage('Authentication required')}
              </ConfigureResourcesPropertyLabel>
              {renderPropertyInfoIcon(formatMessage('Configure whether authentication to Registry is required'))}
            </Stack>
          </Stack>
          <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
            <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
              <ConfigureResourcesPropertyLabel>{formatMessage('Username')}</ConfigureResourcesPropertyLabel>
              {renderPropertyInfoIcon(formatMessage('Registry Username'))}
            </Stack>
            <TextField
              placeholder={formatMessage('Username')}
              styles={configureResourceTextFieldStyles}
              value={formData.username}
              onChange={(e, v) => {
                updateFormData('username', v);
              }}
            />
          </Stack>
          <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
            <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
              <ConfigureResourcesPropertyLabel>{formatMessage('Password')}</ConfigureResourcesPropertyLabel>
              {renderPropertyInfoIcon(formatMessage('Registry Password'))}
            </Stack>
            <TextField
              styles={configureResourceTextFieldStyles}
              type="password"
              value={formData.password}
              onChange={(e, v) => {
                updateFormData('password', v);
              }}
            />
          </Stack>
        </Stack>
      </form>
    </ScrollablePane>
  );

  const PageImageConfig = (
    <ScrollablePane
      data-is-scrollable="true"
      scrollbarVisibility={ScrollbarVisibility.auto}
      style={{ height: 'calc(100vh - 65px)' }}
    >
      <form style={{ width: '100%' }}>
        <Stack>
          <ConfigureResourcesSectionName>{formatMessage('Image Settings')}</ConfigureResourcesSectionName>
          <ConfigureResourcesSectionDescription>
            {formatMessage('Configure your image information.')}
          </ConfigureResourcesSectionDescription>

          <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
            <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
              <ConfigureResourcesPropertyLabel required>{formatMessage('Image Name')}</ConfigureResourcesPropertyLabel>
              {renderPropertyInfoIcon(formatMessage('The name of your image, without registry'))}
            </Stack>
            <TextField
              placeholder={formatMessage('Image name')}
              styles={configureResourceTextFieldStyles}
              value={formData.image}
              onChange={(e, v) => {
                updateFormData('image', v);
              }}
            />
          </Stack>

          <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
            <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
              <ConfigureResourcesPropertyLabel required>{formatMessage('Image Tag')}</ConfigureResourcesPropertyLabel>
              {renderPropertyInfoIcon(formatMessage('The tag for your image'))}
            </Stack>
            <TextField
              placeholder={formatMessage('Image tag')}
              styles={configureResourceTextFieldStyles}
              value={formData.tag}
              onChange={(e, v) => {
                updateFormData('tag', v);
              }}
            />
          </Stack>
        </Stack>
      </form>
    </ScrollablePane>
  );

  const PageReview = useMemo(() => {
    return (
      <ScrollablePane
        data-is-scrollable="true"
        scrollbarVisibility={ScrollbarVisibility.auto}
        style={{ height: 'calc(100vh - 65px)' }}
      >
        <form style={{ width: '100%' }}>
          <Stack>
            <ConfigureResourcesSectionName>{formatMessage('Review')}</ConfigureResourcesSectionName>

            <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
              <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
                <ConfigureResourcesPropertyLabel>{formatMessage('Registry Kind')}</ConfigureResourcesPropertyLabel>
              </Stack>
              <TextField
                readOnly={true}
                styles={configureResourceTextFieldStyles}
                value={RegistryTypeOptions.find((el) => el.key == formData.creationType).text}
              />
            </Stack>

            <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
              <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
                <ConfigureResourcesPropertyLabel>{formatMessage('Registry:')}</ConfigureResourcesPropertyLabel>
              </Stack>
              <TextField readOnly={true} styles={configureResourceTextFieldStyles} value={formData.url} />
            </Stack>

            <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
              <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
                <ConfigureResourcesPropertyLabel>{formatMessage('Username:')}</ConfigureResourcesPropertyLabel>
              </Stack>
              <TextField readOnly={true} styles={configureResourceTextFieldStyles} value={formData.username} />
            </Stack>

            <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
              <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
                <ConfigureResourcesPropertyLabel>{formatMessage('Password:')}</ConfigureResourcesPropertyLabel>
              </Stack>
              <TextField
                type="password"
                readOnly={true}
                styles={configureResourceTextFieldStyles}
                value={formData.password}
              />
            </Stack>

            <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
              <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
                <ConfigureResourcesPropertyLabel>{formatMessage('Image:')}</ConfigureResourcesPropertyLabel>
              </Stack>
              <TextField
                readOnly={true}
                styles={configureResourceTextFieldStyles}
                value={`${formData.image}:${formData.tag}`}
              />
            </Stack>
          </Stack>
        </form>
      </ScrollablePane>
    );
  }, [page, formData.creationType]);

  const PageFooter = useMemo(() => {
    if (page === PageTypes.RegistryType) {
      return (
        <>
          <DefaultButton
            style={{ margin: '0 4px' }}
            text={formatMessage('Back')}
            onClick={() => {
              onBack();
            }}
          />
          <PrimaryButton
            disabled={!formData.creationType}
            style={{ margin: '0 4px' }}
            text={formatMessage('Next')}
            onClick={() => {
              if (formData.creationType === 'local') {
                setPageAndTitle(PageTypes.Image);
              } else if (formData.creationType === 'acr') {
                setPageAndTitle(PageTypes.ACRConfig);
              } else {
                setPageAndTitle(PageTypes.RegistryConfig);
              }
            }}
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
    } else if (page === PageTypes.RegistryConfig || page === PageTypes.ACRConfig) {
      return (
        <>
          <DefaultButton
            style={{ margin: '0 4px' }}
            text={formatMessage('Back')}
            onClick={() => {
              setPageAndTitle(PageTypes.RegistryType);
            }}
          />
          <PrimaryButton
            style={{ margin: '0 4px' }}
            text={formatMessage('Next')}
            disabled={page === PageTypes.RegistryConfig ? isNextRegistryConfigDisabled : isNextACRConfigDisabled}
            onClick={() => {
              setPageAndTitle(PageTypes.Image);
            }}
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
    } else if (page === PageTypes.Image) {
      return (
        <>
          <DefaultButton
            style={{ margin: '0 4px' }}
            text={formatMessage('Back')}
            onClick={() => {
              if (formData.creationType === 'local') {
                setPageAndTitle(PageTypes.RegistryType);
              } else if (formData.creationType === 'acr') {
                setPageAndTitle(PageTypes.ACRConfig);
              } else {
                setPageAndTitle(PageTypes.RegistryConfig);
              }
            }}
          />
          <PrimaryButton
            style={{ margin: '0 4px' }}
            text={formatMessage('Next')}
            disabled={isNextImageConfigDisabled}
            onClick={() => {
              setPageAndTitle(PageTypes.Review);
            }}
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
    } else if (page === PageTypes.Review) {
      return (
        <>
          <DefaultButton
            style={{ margin: '0 4px' }}
            text={formatMessage('Back')}
            onClick={() => {
              setPageAndTitle(PageTypes.Image);
            }}
          />
          <PrimaryButton
            style={{ margin: '0 4px' }}
            text={formatMessage('Create')}
            onClick={() => {
              onSave();
            }}
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
  }, [page, formData]);

  /// End Pages

  return (
    <Fragment>
      <div
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ flex: 1, minHeight: '230px' }}>
          {page === PageTypes.RegistryType && PageRegistry}
          {page === PageTypes.ACRConfig && PageACRConfig}
          {page === PageTypes.RegistryConfig && PageRegistryConfig}
          {page === PageTypes.Image && PageImageConfig}
          {page === PageTypes.Review && PageReview}
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
