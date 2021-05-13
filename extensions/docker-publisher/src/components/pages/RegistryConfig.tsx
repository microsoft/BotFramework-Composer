import * as React from 'react';
import formatMessage from 'format-message';
import { ScrollablePane, ScrollbarVisibility, Stack, TextField } from 'office-ui-fabric-react';
import { useState, useEffect } from 'react';
import { renderPropertyInfoIcon } from './utils';
import {
  ConfigureResourcesSectionName,
  ConfigureResourcesSectionDescription,
  configureResourcePropertyStackTokens,
  configureResourcePropertyLabelStackStyles,
  ConfigureResourcesPropertyLabel,
  configureResourceTextFieldStyles,
} from './styles';
import { OnChangeDelegate } from '../../types/types';

type Props = {
  registryUrl: string;
  username: string;
  password: string;
  onRegistryUrlChanged: OnChangeDelegate;
  onUsernameChanged: OnChangeDelegate;
  onPasswordChanged: OnChangeDelegate;
};

export const RegistryConfig = ({
  registryUrl: controlledRegistryUrl,
  username: controlledUsername,
  password: controlledPassword,
  onRegistryUrlChanged,
  onUsernameChanged,
  onPasswordChanged,
}: Props) => {
  const [registryUrl, setRegistryUrl] = useState(controlledRegistryUrl);
  const [username, setUsername] = useState(controlledUsername);
  const [password, setPassword] = useState(controlledPassword);

  useEffect(() => setRegistryUrl(controlledRegistryUrl), [controlledRegistryUrl]);
  useEffect(() => setUsername(controlledUsername), [controlledUsername]);
  useEffect(() => setPassword(controlledPassword), [controlledPassword]);

  return (
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
              value={registryUrl}
              onChange={(e, v) => onRegistryUrlChanged(e, v)}
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
              value={username}
              onChange={(e, v) => onUsernameChanged(e, v)}
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
              value={password}
              onChange={(e, v) => onPasswordChanged(e, v)}
            />
          </Stack>
        </Stack>
      </form>
    </ScrollablePane>
  );
};
