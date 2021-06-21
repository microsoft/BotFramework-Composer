// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
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
  Label,
  IStackTokens,
  IStackItemStyles,
  Link,
} from 'office-ui-fabric-react';
import { usePublishApi } from '@bfc/extension-client';

import { useDispatcher } from '../../../hooks/useDispatcher';
import { TenantPicker } from '../../resourceConfiguration/TenantPicker';
import { SubscriptionPicker } from '../../resourceConfiguration/SubscriptionPicker';
import { ResourceGroupPicker } from '../../resourceConfiguration/ResourceGroupPicker';
import { DeployLocationPicker } from '../../resourceConfiguration/DeployLocationPicker';
import { useResourceConfiguration } from '../../../hooks/useResourceConfiguration';
import { ResourceNameTextField } from '../../resourceConfiguration/ResourceNameTextField';
import { LuisRegionPicker } from '../../resourceConfiguration/LuisRegionPicker';
import { LuisAuthoringSupportLocation } from '../../../constants';
import { userInfoState } from '../../../recoilModel/atoms/resourceConfigurationState';

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

const urls = {
  luisReferenceRegions: 'https://docs.microsoft.com/en-us/azure/cognitive-services/luis/luis-reference-regions',
};

export const ResourceConfigurationStep = (props: Props) => {
  const { setUserInfo } = useDispatcher();
  const { publishConfig } = usePublishApi();
  const userInfo = useRecoilValue(userInfoState);

  const {
    configuration: {
      tenantId,
      deployLocation,
      resourceGroupName,
      subscriptionId,
      luisRegion,
      isNewResourceGroup,
      hostName,
    },
    handleChangeResourceGroup,
    handleChangeDeployLocation,
    handleChangeSubscription,
    handleValidateHostName,
    handleValidateResourceGroupName,
    handleChangeTenant,
    handleFetchDeployLocation,
    handleChangeLuisRegion,
    handleChangeHostName,
    isValidConfiguration,
    deployLocations,
  } = useResourceConfiguration();

  const { onResourceConfigurationChange } = props;

  React.useEffect(() => {
    onResourceConfigurationChange(isValidConfiguration);
  }, [isValidConfiguration]);

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
                disabled: !!publishConfig?.tenantId,
                styles: autoCompleteTextFieldStyles,
                onChange: (e, newValue) => {
                  if (newValue.length === 0) handleChangeTenant('');
                },
              }}
              value={tenantId}
              onChangeTenant={handleChangeTenant}
              onClear={() => handleChangeTenant('')}
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
                disabled: !!publishConfig?.subscriptionId,
                styles: autoCompleteTextFieldStyles,
                onChange: (_, newValue) => {
                  if (newValue.length === 0) handleChangeSubscription('');
                },
              }}
              value={subscriptionId}
              onChangeSubscription={handleChangeSubscription}
              onClear={() => handleChangeSubscription('')}
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
              isNewResourceGroup={isNewResourceGroup}
              subscriptionId={subscriptionId}
              textFieldProps={{
                disabled: !!publishConfig?.resourceGroup?.name,
                styles: autoCompleteTextFieldStyles,
                onChange: (_, newValue) => {
                  if (newValue.length === 0) handleChangeResourceGroup('', false);
                },
              }}
              value={resourceGroupName}
              onChangeResourceGroup={handleChangeResourceGroup}
              onClear={() => handleChangeResourceGroup('', false)}
              onValidateResourceGroupName={handleValidateResourceGroupName}
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
            <ResourceNameTextField
              accessToken={userInfo?.token}
              disabled={!!publishConfig?.hostName}
              styles={autoCompleteTextFieldStyles}
              subscriptionId={subscriptionId}
              value={hostName}
              onChangeHostName={handleChangeHostName}
              onValidateHostName={handleValidateHostName}
            />
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
                disabled: !!publishConfig?.deployLocation,
                styles: autoCompleteTextFieldStyles,
                onChange: (_, newValue) => {
                  if (newValue.length === 0) handleChangeDeployLocation('');
                },
              }}
              value={deployLocation}
              onChangeDeployLocation={handleChangeDeployLocation}
              onClear={() => handleChangeDeployLocation('')}
              onFetchDeployLocations={handleFetchDeployLocation}
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
              <LearnMoreLink href={urls.luisReferenceRegions} target="_blank">
                {formatMessage('Learn more')}
              </LearnMoreLink>
            </Stack>
            <LuisRegionPicker
              items={deployLocations
                .filter((dl) => LuisAuthoringSupportLocation.includes(dl.name))
                .map((i) => ({ key: i.name, text: i.displayName }))}
              textFieldProps={{
                disabled: !!publishConfig?.settings?.luis?.region,
                styles: autoCompleteTextFieldStyles,
                onChange: (_, newValue) => {
                  if (newValue.length === 0) handleChangeLuisRegion(undefined);
                },
              }}
              value={luisRegion}
              onChangeLuisRegion={handleChangeLuisRegion}
              onClear={() => handleChangeLuisRegion(undefined)}
            />
          </Stack>
        </Stack>
      </FullWidthForm>
    </ScrollablePane>
  );
};
