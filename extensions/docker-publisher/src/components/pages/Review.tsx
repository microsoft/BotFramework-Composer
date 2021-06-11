// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import formatMessage from 'format-message';
import { useState, useEffect } from 'react';
import { ScrollablePane, ScrollbarVisibility, Stack, TextField } from 'office-ui-fabric-react';

import { OnChangeDelegate, RegistryConfigData, RegistryTypeOptions } from '../../types';

import {
  ConfigureResourcesSectionName,
  configureResourcePropertyStackTokens,
  configureResourcePropertyLabelStackStyles,
  ConfigureResourcesPropertyLabel,
  configureResourceTextFieldStyles,
} from './styles';
import { renderPropertyInfoIcon } from './utils';

export const Review = ({
  creationType: controlledCreationType,
  url: controlledRegistryUrl,
  username: controlledUsername,
  password: controlledPassword,
  image: controlledImageName,
  tag: controlledImageTag,
}: RegistryConfigData) => {
  const [creationType, setCreationType] = useState<string>(controlledCreationType);
  const [registryUrl, setRegistryUrl] = useState(controlledRegistryUrl);
  const [username, setUsername] = useState(controlledUsername);
  const [password, setPassword] = useState(controlledPassword);
  const [imageName, setImageName] = useState(controlledImageName);
  const [imageTag, setImageTag] = useState(controlledImageTag);

  useEffect(() => setCreationType(controlledCreationType || 'local'), [controlledCreationType]);
  useEffect(() => setRegistryUrl(controlledRegistryUrl), [controlledRegistryUrl]);
  useEffect(() => setUsername(controlledUsername), [controlledUsername]);
  useEffect(() => setPassword(controlledPassword), [controlledPassword]);
  useEffect(() => setImageName(controlledImageName), [controlledImageName]);
  useEffect(() => setImageTag(controlledImageTag), [controlledImageTag]);

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
              readOnly
              styles={configureResourceTextFieldStyles}
              value={RegistryTypeOptions.find((el) => el.key == creationType).text}
            />
          </Stack>

          {creationType !== 'local' && creationType !== 'dockerhub' && (
            <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
              <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
                <ConfigureResourcesPropertyLabel>{formatMessage('Registry:')}</ConfigureResourcesPropertyLabel>
              </Stack>
              <TextField readOnly styles={configureResourceTextFieldStyles} value={registryUrl} />
            </Stack>
          )}

          {creationType !== 'local' && (
            <>
              <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
                <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
                  <ConfigureResourcesPropertyLabel>{formatMessage('Username:')}</ConfigureResourcesPropertyLabel>
                </Stack>
                <TextField readOnly styles={configureResourceTextFieldStyles} value={username} />
              </Stack>

              <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
                <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
                  <ConfigureResourcesPropertyLabel>{formatMessage('Password:')}</ConfigureResourcesPropertyLabel>
                </Stack>
                <TextField readOnly styles={configureResourceTextFieldStyles} type="password" value={password} />
              </Stack>
            </>
          )}

          <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
            <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
              <ConfigureResourcesPropertyLabel>{formatMessage('Image:')}</ConfigureResourcesPropertyLabel>
            </Stack>
            <TextField readOnly styles={configureResourceTextFieldStyles} value={`${imageName}:${imageTag}`} />
          </Stack>
        </Stack>
      </form>
    </ScrollablePane>
  );
};
