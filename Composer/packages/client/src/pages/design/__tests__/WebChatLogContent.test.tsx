// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';

import { renderWithRecoil } from '../../../../__tests__/testUtils/renderWithRecoil';
import { botProjectIdsState, webChatLogsState } from '../../../recoilModel';
import { WebchatLogContent } from '../DebugPanel/TabExtensions/WebchatLog/WebchatLogContent';

const rootBotId = '123-adc';
const scrollIntoViewMock = jest.fn();
window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

describe('<DebugPanel />', () => {
  beforeEach(() => {});

  describe('<WebChatLogContent />', () => {
    fit('should render Webchat inspector header', async () => {
      renderWithRecoil(<WebchatLogContent isActive />, ({ set }) => {
        set(botProjectIdsState, [rootBotId]);
        set(webChatLogsState(rootBotId), [
          {
            timestamp: '2020-07-12',
            route: 'POST: http://directline/conversation',
            logType: 'Error',
            status: 404,
            message: 'An error occured posting',
          },
        ]);
      });
      expect(scrollIntoViewMock).toHaveBeenCalledTimes(1);
    });
  });
});
