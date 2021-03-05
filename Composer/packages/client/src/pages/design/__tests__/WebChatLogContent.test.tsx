// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';

import { renderWithRecoil, wrapWithRecoil } from '../../../../__tests__/testUtils/renderWithRecoil';
import { botProjectIdsState, projectMetaDataState, webChatLogsState } from '../../../recoilModel';
import { WebchatLogContent } from '../DebugPanel/TabExtensions/WebchatLog/WebchatLogContent';

const rootBotId = '123-adc';
const scrollIntoViewMock = jest.fn();
const previousScroll = window.HTMLElement.prototype.scrollIntoView;
window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

describe('<DebugPanel />', () => {
  beforeEach(() => {
    scrollIntoViewMock.mockClear();
  });

  afterAll(() => {
    window.HTMLElement.prototype.scrollIntoView = previousScroll;
  });

  describe('<WebChatLogContent />', () => {
    it('should scroll to the newest item', async () => {
      renderWithRecoil(<WebchatLogContent isActive />, ({ set }) => {
        set(botProjectIdsState, [rootBotId]);
        set(projectMetaDataState(rootBotId), {
          isRemote: false,
          isRootBot: true,
        });
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

    it('should scroll to the newest item when it webchat inspector is active tab', async () => {
      const { rerender } = renderWithRecoil(<WebchatLogContent isActive={false} />, ({ set }) => {
        set(botProjectIdsState, [rootBotId]);
        set(projectMetaDataState(rootBotId), {
          isRemote: false,
          isRootBot: true,
        });
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

      expect(scrollIntoViewMock).toHaveBeenCalledTimes(0);
      rerender(wrapWithRecoil(<WebchatLogContent isActive />));
      expect(scrollIntoViewMock).toHaveBeenCalledTimes(1);

      scrollIntoViewMock.mockClear();

      rerender(wrapWithRecoil(<WebchatLogContent isActive />));
      expect(scrollIntoViewMock).toHaveBeenCalledTimes(0);
    });
  });
});
