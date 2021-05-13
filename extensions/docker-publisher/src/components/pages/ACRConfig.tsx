import * as React from 'react';
import formatMessage from 'format-message';
import { useState, useEffect, useMemo, useRef } from 'react';
import { ScrollablePane, ScrollbarVisibility, Stack, Dropdown, TextField } from 'office-ui-fabric-react';
import {
  ConfigureResourcesSectionName,
  ConfigureResourcesSectionDescription,
  configureResourcePropertyStackTokens,
  configureResourcePropertyLabelStackStyles,
  ConfigureResourcesPropertyLabel,
  configureResourceTextFieldStyles,
  configureResourceDropdownStyles,
} from './styles';

import { Subscription } from '@azure/arm-subscriptions/esm/models';
import { ResourceGroup, GenericResource } from '@azure/arm-resources/esm/models';
import { getSubscriptions, getResourceGroups, getResources } from '../../backend/azureApi';

import { renderPropertyInfoIcon } from './utils';
import { OnChangeDelegate } from '../../types';
import { AzureDropDownData } from '../../types/azureTypes';

type Props = {
  creationType: string;
  token: string | null;
  registryUrl: string;
  username: string;
  password: string;

  onRegistryUrlChanged: OnChangeDelegate;
  onUsernameChanged: OnChangeDelegate;
  onPasswordChanged: OnChangeDelegate;
};
export const ACRConfig = ({
  creationType: controlledCreationType,
  token: controlledToken,
  registryUrl: controlledRegistryUrl,
  username: controlledUsername,
  password: controlledPassword,

  onRegistryUrlChanged,
  onUsernameChanged,
  onPasswordChanged,
}: Props) => {
  const [creationType, setCreationType] = useState<string>(controlledCreationType);
  const [token, setToken] = useState<string | null>(controlledToken);
  const [registryUrl, setRegistryUrl] = useState<string>(controlledRegistryUrl);
  const [username, setUsername] = useState<string>(controlledUsername);
  const [password, setPassword] = useState<string>(controlledPassword);

  useEffect(() => setToken(controlledToken), [controlledToken]);
  useEffect(() => setRegistryUrl(controlledRegistryUrl), [controlledRegistryUrl]);
  useEffect(() => setUsername(controlledUsername), [controlledUsername]);
  useEffect(() => setPassword(controlledPassword), [controlledPassword]);

  const isMounted = useRef<boolean>();

  const [subscriptions, setSubscriptions] = useState<Subscription[] | undefined>();
  const [subscription, setSubscription] = useState<AzureDropDownData | undefined>();
  const [resourceGroups, setResourceGroups] = useState<ResourceGroup[] | undefined>();
  const [resourceGroup, setResourceGroup] = useState<AzureDropDownData | undefined>();
  const [azContainerRegistries, setAzContainerRegistries] = useState<GenericResource[] | undefined>();
  const [containerRegistry, setContainerRegistry] = useState<AzureDropDownData | undefined>();

  // Map collections to DropDown
  const subscriptionOptions = useMemo(() => {
    return subscriptions?.map((t) => ({ key: t.subscriptionId, text: t.displayName }));
  }, [subscriptions]);
  const resourceGroupOptions = useMemo(() => {
    return resourceGroups?.map((t) => ({ key: t.id, text: t.name }));
  }, [resourceGroups]);
  const acrOptions = useMemo(() => {
    return azContainerRegistries?.map((t) => ({ key: t.id, text: t.name }));
  }, [azContainerRegistries]);

  // Get Subscriptions on Token Changed
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
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Clear
  useEffect(() => {
    setAzContainerRegistries([]);
  }, [creationType]);
  // Get Resource Groups
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

  // Get ACR Resources
  useEffect(() => {
    if (token && subscription?.id && resourceGroup?.id) {
      getResources(token, subscription.id, resourceGroup.text).then((data) => {
        setAzContainerRegistries(data.filter((el) => el.type === 'Microsoft.ContainerRegistry/registries'));
      });
    }
  }, [resourceGroup, resourceGroup?.id]);

  return (
    <ScrollablePane
      data-is-scrollable="true"
      scrollbarVisibility={ScrollbarVisibility.auto}
      style={{ height: 'calc(100vh - 65px)' }}
    >
      <form style={{ width: '100%' }}>
        <Stack>
          <ConfigureResourcesSectionName>{formatMessage('Azure Details')}</ConfigureResourcesSectionName>
          <ConfigureResourcesSectionDescription>
            {formatMessage(
              'Select your subscription, resource group and Azure Container Registry. Admin User must be enabled.'
            )}
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
                onRegistryUrlChanged(e, `${v.text}.azurecr.io`);
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
              value={username}
              onChange={(e, v) => onUsernameChanged(e, v)}
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
              value={password}
              onChange={(e, v) => onPasswordChanged(e, v)}
            />
          </Stack>
        </Stack>
      </form>
    </ScrollablePane>
  );
};
