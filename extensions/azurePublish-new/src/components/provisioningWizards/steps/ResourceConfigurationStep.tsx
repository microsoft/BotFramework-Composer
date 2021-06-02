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
type ProvisonActionsStylingProps = {
  showSignout: boolean;
};
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
export const ResourceConfigurationStep = (props: Props) => {
  const [userInfo, setUserInfo] = useRecoilState(userInfoState);
  const [tenantId, setTenantId] = useRecoilState(tenantSelectionState);
  const [subscriptionId, setSubscriptionId] = useRecoilState(subscriptionSelectionState);
  const [resourceGroupId, setResourceGroupId] = useRecoilState(resourceGroupSelectionState);

  const { onResourceConfigurationChange } = props;

  const isValidConfiguration = (): boolean => {
    return true;
  };

  const handleTenantChange = (tenantId: string) => {
    setTenantId(tenantId);
    setSubscriptionId('');
    setResourceGroupId('');
  };

  const handleSubscriptionChange = (subscriptionId: string) => {
    setSubscriptionId(subscriptionId);
    onResourceConfigurationChange(isValidConfiguration());
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
            <TenantPicker selectedKey={tenantId} onTenantChange={handleTenantChange} onUserInfoFetch={setUserInfo} />
          </Stack>
          <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
            <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
              <ConfigureResourcesPropertyLabel required>
                {formatMessage('Subscription')}
              </ConfigureResourcesPropertyLabel>
              {renderPropertyInfoIcon(formatMessage('The subscription that will be billed for the resources.'))}
            </Stack>
            <SubscriptionPicker
              accessToken={userInfo?.token}
              selectedKey={subscriptionId}
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
              selectedKey={resourceGroupId}
              subscriptionId={subscriptionId}
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
              <ConfigureResourcesPropertyLabel required>{formatMessage('Region')}</ConfigureResourcesPropertyLabel>
              {renderPropertyInfoIcon(formatMessage('The region where your resources and bot will be used.'))}
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
      </form>
    </ScrollablePane>
  );
};
