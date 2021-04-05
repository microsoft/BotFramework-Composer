// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';

import { renderWithRecoil } from '../../../../__tests__/testUtils/renderWithRecoil';
import { botRuntimeErrorState, botRuntimeLogsState } from '../../../recoilModel';
import { RuntimeLogs } from '../DebugPanel/TabExtensions/RuntimeOutputLog/RuntimeLogs';
const projectId = '123-avw';

describe('<RuntimeLogs />', () => {
  beforeEach(() => {});

  describe('<RuntimeLogs />', () => {
    it('should render Runtime logs', async () => {
      const { findByText } = renderWithRecoil(<RuntimeLogs projectId={projectId} />, ({ set }) => {
        set(botRuntimeLogsState(projectId), 'Bot started at http://localhost:3978/api/messages');
      });
      await findByText('Bot started at http://localhost:3978/api/messages');
    });

    it('should render Runtime errors', async () => {
      const { findByText } = renderWithRecoil(<RuntimeLogs projectId={projectId} />, ({ set }) => {
        set(botRuntimeErrorState(projectId), {
          message: '.NET 3.1 needs to be installed',
          title: '.NET runtime error',
        });
      });
      await findByText('.NET 3.1 needs to be installed');
    });
  });
});
