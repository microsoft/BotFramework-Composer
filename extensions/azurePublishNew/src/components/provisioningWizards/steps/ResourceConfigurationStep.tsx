// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';
import formatMessage from 'format-message';
import { FluentTheme, NeutralColors } from '@uifabric/fluent-theme';
import {
  ScrollablePane,
  ScrollbarVisibility,
  TooltipHost,
  Icon,
  Stack,
  Text,
  FontWeights,
  FontSizes,
  Label,
  IStackTokens,
  IStackItemStyles,
  Link,
} from 'office-ui-fabric-react';

import {
  userInfoState,
  resourceGroupSelectionState,
  subscriptionSelectionState,
  tenantSelectionState,
} from '../../../recoilModel/atoms/resourceConfigurationState';
import { ResourceGroupPicker } from '../../resourceConfiguration/ResourceGroupPicker';
import { SubscriptionPicker } from '../../resourceConfiguration/SubscriptionPicker';
import { TenantPicker } from '../../resourceConfiguration/TenantPicker';

type Props = {
  onResourceConfigurationChange: (isValidConfiguration: boolean) => void;
};

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

const autoCompleteTextFieldStyles = { root: { paddingBottom: '4px', width: '300px' } };

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

const FullWidthForm = styled.form`
  width: '100%';
`;

//TODO: a wrapper function would be nice eg: formatMessages({})
const messages = {
  azureDetails: formatMessage('Azure details'),
  azureDirectory: formatMessage('Azure Directory'),
  selectAzureDirectory: formatMessage('Select your Azure directory and subscription, enter resource group name.'),
  learnMore: formatMessage('Learn more'),
  enterResourceName: formatMessage('Enter resource name and select region. This will be applied to the new resources.'),
  activeDirectoryInfo: formatMessage(
    'Azure Active Directory is Microsoft’s cloud-based identity and access management service.'
  ),
  subscription: formatMessage('Subscription'),
  subscriptionInfo: formatMessage('The subscription that will be billed for the resources.'),
  resourceGroup: formatMessage('Resource group'),
  resourceGroupInfo: formatMessage(
    'A custom resource group name that you choose or create. Resource groups allow you to group Azure resources for access and management.'
  ),
  resourceDetails: formatMessage('Resource details'),
  name: formatMessage('Name'),
  uniqueResourceName: formatMessage('A unique name for your resources.'),
  region: formatMessage('Region'),
  luisRegion: formatMessage('LUIS region'),
  regionIconInfo: formatMessage('The region where your resources and bot will be used.'),
  luisRegionIconInfo: formatMessage('The region associated with your Language understanding model.'),
};
export const ResourceConfigurationStep = (props: Props) => {
  const [userInfo, setUserInfo] = useRecoilState(userInfoState);
  const [tenantId, setTenantId] = useRecoilState(tenantSelectionState);
  const [subscriptionId, setSubscriptionId] = useRecoilState(subscriptionSelectionState);
  const [resourceGroupId, setResourceGroupId] = useRecoilState(resourceGroupSelectionState);

  const { onResourceConfigurationChange } = props;

  const isValidConfiguration = React.useCallback((): boolean => {
    let isInValid = !tenantId || tenantId.length === 0;
    isInValid = isInValid || !subscriptionId || subscriptionId.length === 0;
    return !isInValid;
  }, [tenantId, subscriptionId]);

  React.useEffect(() => {
    onResourceConfigurationChange(isValidConfiguration());
  }, [tenantId, subscriptionId]);

  const handleTenantChange = (tenantId: string) => {
    setTenantId(tenantId);
    //setSubscriptionId('');
    //setResourceGroupId('');
  };

  const handleSubscriptionChange = (subscriptionId: string) => {
    setSubscriptionId(subscriptionId);
  };

  const handleResourceGroupChange = (resourceGroupId: string) => {
    setResourceGroupId(resourceGroupId);
    onResourceConfigurationChange(isValidConfiguration());
  };
  const renderPropertyInfoIcon = (tooltip: string) => {
    return (
      <TooltipHost content={tooltip}>
        <Icon iconName="Unknown" styles={configureResourcesIconStyle} />
      </TooltipHost>
    );
  };
  return (
    <ScrollablePane data-is-scrollable="true" scrollbarVisibility={ScrollbarVisibility.auto}>
      <FullWidthForm>
        <Stack>
          <ConfigureResourcesSectionName>{messages.azureDetails}</ConfigureResourcesSectionName>
          <ConfigureResourcesSectionDescription>{messages.selectAzureDirectory}</ConfigureResourcesSectionDescription>
          <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
            <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
              <ConfigureResourcesPropertyLabel required>{messages.azureDirectory}</ConfigureResourcesPropertyLabel>
              {renderPropertyInfoIcon(messages.activeDirectoryInfo)}
            </Stack>
            <TenantPicker
              textFieldProps={{
                styles: autoCompleteTextFieldStyles,
                onChange: (e, newValue) => {
                  if (newValue.length === 0) handleTenantChange('');
                },
              }}
              value={tenantId}
              onClear={() => handleTenantChange('')}
              onTenantChange={handleTenantChange}
              onUserInfoFetch={setUserInfo}
            />
          </Stack>
          <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
            <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
              <ConfigureResourcesPropertyLabel required>{messages.subscription}</ConfigureResourcesPropertyLabel>
              {renderPropertyInfoIcon(messages.subscriptionInfo)}
            </Stack>
            <SubscriptionPicker
              accessToken={userInfo?.token}
              textFieldProps={{
                styles: autoCompleteTextFieldStyles,
                onChange: (e, newValue) => {
                  if (newValue.length === 0) handleSubscriptionChange('');
                },
              }}
              value={subscriptionId}
              onClear={() => handleSubscriptionChange('')}
              onSubscriptionChange={handleSubscriptionChange}
            />
          </Stack>
          <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
            <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
              <ConfigureResourcesPropertyLabel required>{messages.resourceGroup}</ConfigureResourcesPropertyLabel>
              {renderPropertyInfoIcon(messages.resourceGroupInfo)}
            </Stack>
            <ResourceGroupPicker
              accessToken={userInfo?.token}
              subscriptionId={subscriptionId}
              textFieldProps={{ styles: autoCompleteTextFieldStyles }}
              value={resourceGroupId}
              onResourceGroupChange={handleResourceGroupChange}
            />
          </Stack>
          <ConfigureResourcesSectionName>{messages.resourceDetails}</ConfigureResourcesSectionName>
          <ConfigureResourcesSectionDescription>{messages.enterResourceName}</ConfigureResourcesSectionDescription>
          <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
            <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
              <ConfigureResourcesPropertyLabel required>{messages.name}</ConfigureResourcesPropertyLabel>
              {renderPropertyInfoIcon(messages.uniqueResourceName)}
            </Stack>
            {/* <TextField
              disabled={currentConfig?.hostname || currentConfig?.name}
              errorMessage={errorHostName}
              placeholder={formatMessage('New resource name')}
              styles={configureResourceTextFieldStyles}
              value={formData.hostname}
              onChange={newHostName}
            /> */}
          </Stack>
          <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
            <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
              <ConfigureResourcesPropertyLabel required>{messages.region}</ConfigureResourcesPropertyLabel>
              {renderPropertyInfoIcon(messages.regionIconInfo)}
            </Stack>
            {/* <Dropdown
              disabled={currentConfig?.region}
              options={deployLocationOptions}
              placeholder={formatMessage('Select one')}
              selectedKey={formData.region}
              styles={configureResourceDropdownStyles}
              onChange={updateCurrentLocation}
            /> */}
          </Stack>
          <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
            <Stack>
              <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
                <ConfigureResourcesPropertyLabel required>{messages.luisRegion}</ConfigureResourcesPropertyLabel>
                {renderPropertyInfoIcon(messages.luisRegionIconInfo)}
              </Stack>
              <LearnMoreLink
                href="https://docs.microsoft.com/en-us/azure/cognitive-services/luis/luis-reference-regions"
                target="_blank"
              >
                {messages.learnMore}
              </LearnMoreLink>
            </Stack>
            {/* <Dropdown
              disabled={currentConfig?.settings?.luis?.region}
              options={luisLocationOptions}
              placeholder={formatMessage('Select one')}
              selectedKey={formData.luisLocation}
              styles={configureResourceDropdownStyles}
              onChange={(e, o) => {
                updateFormData('luisLocation', o.key as string);
              }}
            /> */}
          </Stack>
        </Stack>
      </FullWidthForm>
    </ScrollablePane>
  );
};
