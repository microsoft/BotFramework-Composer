// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import WS from 'jest-websocket-mock';
import { act } from '@testing-library/react';

import httpClient from '../../../utils/httpUtil';
import { renderWithRecoil } from '../../../../__tests__/testUtils/renderWithRecoil';
import { botBuildTimeErrorState } from '../../../recoilModel';
import { RuntimeOutputLog } from '../DebugPanel/TabExtensions/RuntimeOutputLog/RuntimeOutputLog';
const projectId = '123-avw';

jest.mock('../../../utils/httpUtil');
const standardOut = `/Users/tester/Desktop/conversational_core_3/conversational_core_3/conversational_core_3.csproj : warning NU1701: Package 'Microsoft.Azure.KeyVault.Core 1.0.0' was restored using '.NETFramework,Version=v4.6.1, .NETFramework,Version=v4.6.2, .NETFramework,Version=v4.7, .NETFramework,Version=v4.7.1, .NETFramework,Version=v4.7.2, .NETFramework,Version=v4.8' instead of the project target framework '.NETCoreApp,Version=v3.1'. This package may not be fully compatible with your project.
        /Users/tester/Desktop/conversational_core_3/conversational_core_3/conversational_core_3.csproj : warning NU1701: Package 'Microsoft.Azure.KeyVault.Core 1.0.0' was restored using '.NETFramework,Version=v4.6.1, .NETFramework,Version=v4.6.2, .NETFramework,Version=v4.7, .NETFramework,Version=v4.7.1, .NETFramework,Version=v4.7.2, .NETFramework,Version=v4.8' instead of the project target framework '.NETCoreApp,Version=v3.1'. This package may not be fully compatible with your project.
        info: Microsoft.Hosting.Lifetime[0]
              Now listening on: http://0.0.0.0:3988
        info: Microsoft.Hosting.Lifetime[0]
              Application started. Press Ctrl+C to shut down.
        info: Microsoft.Hosting.Lifetime[0]
              Hosting environment: Development
        info: Microsoft.Hosting.Lifetime[0]
              Content root path: /Users/tester/Desktop/conversational_core_3/conversational_core_3
        `;

describe('<RuntimeLog />', () => {
  let mockWSServer;
  beforeAll(() => {
    const url = `ws://localhost:1234/test/${projectId}`;
    (httpClient.get as jest.Mock).mockResolvedValue({
      data: url,
    });
    mockWSServer = new WS(`ws://localhost:1234/test/${projectId}`);
  });

  afterAll(() => {
    mockWSServer = null;
  });

  describe('<RuntimeLog />', () => {
    it('should render Runtime logs', async () => {
      const { findByTestId } = renderWithRecoil(<RuntimeOutputLog projectId={projectId} />);
      await mockWSServer.connected;
      act(() => {
        const stringified = JSON.stringify({
          standardOutput: standardOut,
          standardError: '',
        });
        mockWSServer.send(stringified);
      });
      await findByTestId('runtime-standard-output');
    });

    it('should render Runtime standard errors', async () => {
      const { findByText } = renderWithRecoil(<RuntimeOutputLog projectId={projectId} />);
      await mockWSServer.connected;
      act(() => {
        const stringified = JSON.stringify({
          standardOutput: '',
          standardError: 'Command failed: dotnet user-secrets',
        });
        mockWSServer.send(stringified);
      });
      await findByText('Install Microsoft .NET Core SDK');
    });

    it('should render Runtime errors', async () => {
      const { findByText } = renderWithRecoil(<RuntimeOutputLog projectId={projectId} />, ({ set }) => {
        set(botBuildTimeErrorState(projectId), {
          message: '.NET 3.1 needs to be installed',
          title: '.NET runtime error',
        });
      });
      await findByText('.NET 3.1 needs to be installed');
    });
  });
});
