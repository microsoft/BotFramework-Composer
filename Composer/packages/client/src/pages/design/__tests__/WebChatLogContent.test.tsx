// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';

import { renderWithRecoil, wrapWithRecoil } from '../../../../__tests__/testUtils/renderWithRecoil';
import { botProjectIdsState, projectMetaDataState, webChatTrafficState } from '../../../recoilModel';
import { WebChatLogContent } from '../DebugPanel/TabExtensions/WebChatLog/WebChatLogContent';

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
      renderWithRecoil(<WebChatLogContent isActive />, ({ set }) => {
        set(botProjectIdsState, [rootBotId]);
        set(projectMetaDataState(rootBotId), {
          isRemote: false,
          isRootBot: true,
        });
        set(webChatTrafficState(rootBotId), [
          {
            activity: {} as any,
            id: '',
            trafficType: 'activity',
            timestamp: Date.now(),
          },
        ]);
      });
      expect(scrollIntoViewMock).toHaveBeenCalledTimes(1);
    });

    it('should scroll to the newest item when the webchat inspector is the active tab', async () => {
      const { rerender } = renderWithRecoil(<WebChatLogContent isActive={false} />, ({ set }) => {
        set(botProjectIdsState, [rootBotId]);
        set(projectMetaDataState(rootBotId), {
          isRemote: false,
          isRootBot: true,
        });
        set(webChatTrafficState(rootBotId), [
          {
            activity: {} as any,
            id: '',
            trafficType: 'activity',
            timestamp: Date.now(),
          },
        ]);
      });

      expect(scrollIntoViewMock).toHaveBeenCalledTimes(0);
      rerender(wrapWithRecoil(<WebChatLogContent isActive />));
      expect(scrollIntoViewMock).toHaveBeenCalledTimes(1);

      scrollIntoViewMock.mockClear();

      rerender(wrapWithRecoil(<WebChatLogContent isActive />));
      expect(scrollIntoViewMock).toHaveBeenCalledTimes(0);
    });
  });
});
