import * as React from 'react';
import formatMessage from 'format-message';
import { useState, useEffect } from 'react';
import { ScrollablePane, ScrollbarVisibility, Stack, TextField } from 'office-ui-fabric-react';
import {
  ConfigureResourcesSectionName,
  configureResourcePropertyStackTokens,
  configureResourcePropertyLabelStackStyles,
  ConfigureResourcesPropertyLabel,
  configureResourceTextFieldStyles,
} from './styles';
import { renderPropertyInfoIcon } from './utils';
import { OnChangeDelegate } from '../../types';

type Props = {
  username: string;
  usernameChanged: OnChangeDelegate;
  password: string;
  passwordChanged: OnChangeDelegate;
};

export const DockerHubConfig = ({
  username: controlledUsername,
  usernameChanged,
  password: controlledPassword,
  passwordChanged,
}: Props) => {
  const [username, setUsername] = useState(controlledUsername);
  const [password, setPassword] = useState(controlledPassword);

  useEffect(() => setUsername(controlledUsername), [controlledUsername]);
  useEffect(() => setPassword(controlledUsername), [controlledPassword]);

  return (
    <ScrollablePane
      data-is-scrollable="true"
      scrollbarVisibility={ScrollbarVisibility.auto}
      style={{ height: 'calc(100vh - 65px)' }}
    >
      <form style={{ width: '100%' }}>
        <Stack>
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
              onChange={(e, v) => usernameChanged(e, v)}
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
              onChange={(e, v) => passwordChanged(e, v)}
            />
          </Stack>
        </Stack>
      </form>
    </ScrollablePane>
  );
};
