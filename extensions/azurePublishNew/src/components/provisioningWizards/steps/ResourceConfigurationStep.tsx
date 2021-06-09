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
  deployLocationSelectionState,
} from '../../../recoilModel/atoms/resourceConfigurationState';
import { ResourceGroupPicker } from '../../resourceConfiguration/ResourceGroupPicker';
import { SubscriptionPicker } from '../../resourceConfiguration/SubscriptionPicker';
import { TenantPicker } from '../../resourceConfiguration/TenantPicker';
import { DeployLocationPicker } from '../../resourceConfiguration/DeployLocationPicker';

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

export const ResourceConfigurationStep = (props: Props) => {
  const [userInfo, setUserInfo] = useRecoilState(userInfoState);
  const [tenantId, setTenantId] = useRecoilState(tenantSelectionState);
  const [subscriptionId, setSubscriptionId] = useRecoilState(subscriptionSelectionState);
  const [resourceGroupId, setResourceGroupId] = useRecoilState(resourceGroupSelectionState);
  const [deployLocationId, setDeployLocationId] = useRecoilState(deployLocationSelectionState);

  const { onResourceConfigurationChange } = props;

  const isValidConfiguration = React.useMemo((): boolean => !(!tenantId || !subscriptionId || !resourceGroupId), [
    tenantId,
    subscriptionId,
    resourceGroupId,
  ]);

  React.useEffect(() => {
    onResourceConfigurationChange(isValidConfiguration);
  }, [isValidConfiguration]);

  const handleTenantChange = (tenantId: string) => {
    setTenantId(tenantId);
    if (!tenantId) {
      setSubscriptionId('');
    }
  };

  const handleSubscriptionChange = (subscriptionId: string) => {
    setSubscriptionId(subscriptionId);
    if (!subscriptionId) {
      setResourceGroupId('');
      setDeployLocationId('');
    }
  };

  const handleResourceGroupChange = (resourceGroupId: string) => {
    setResourceGroupId(resourceGroupId);
  };

  const handleDeployLocationChange = (deployLocationId: string) => {
    setDeployLocationId(deployLocationId);
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
              <ConfigureResourcesPropertyLabel required>
                {formatMessage('Subscription')}
              </ConfigureResourcesPropertyLabel>
              {renderPropertyInfoIcon('The subscription that will be billed for the resources.')}
            </Stack>
            <SubscriptionPicker
              accessToken={userInfo?.token}
              textFieldProps={{
                styles: autoCompleteTextFieldStyles,
                onChange: (_, newValue) => {
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
              accessToken={userInfo?.token}
              subscriptionId={subscriptionId}
              textFieldProps={{
                styles: autoCompleteTextFieldStyles,
                onChange: (_, newValue) => {
                  if (newValue.length === 0) handleResourceGroupChange('');
                },
              }}
              value={resourceGroupId}
              onClear={() => handleResourceGroupChange('')}
              onResourceGroupChange={handleResourceGroupChange}
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
          </Stack>
          <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
            <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
              <ConfigureResourcesPropertyLabel required>{formatMessage('Region')}</ConfigureResourcesPropertyLabel>
              {renderPropertyInfoIcon('The region where your resources and bot will be used.')}
            </Stack>
            <DeployLocationPicker
              accessToken={userInfo?.token}
              subscriptionId={subscriptionId}
              textFieldProps={{
                styles: autoCompleteTextFieldStyles,
                onChange: (_, newValue) => {
                  if (newValue.length === 0) handleDeployLocationChange('');
                },
              }}
              value={deployLocationId}
              onClear={() => handleDeployLocationChange('')}
              onDeployLocationChange={handleDeployLocationChange}
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
          </Stack>
        </Stack>
      </FullWidthForm>
    </ScrollablePane>
  );
};
