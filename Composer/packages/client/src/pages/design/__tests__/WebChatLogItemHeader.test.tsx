// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';

import { renderWithRecoil, wrapWithRecoil } from '../../../../__tests__/testUtils/renderWithRecoil';
import { botProjectIdsState, projectMetaDataState, webChatLogsState } from '../../../recoilModel';
import { WebChatLogItemHeader } from '../DebugPanel/TabExtensions/WebchatLog/WebchatLogItemHeader';

const rootBotId = '123-adc';

describe('<DebugPanel />', () => {
  beforeEach(() => {});

  describe('<WebchatLogItemheader />', () => {
    it('should render Webchat inspector header', async () => {
      const { findByText } = renderWithRecoil(<WebChatLogItemHeader isActive />, ({ set }) => {
        set(botProjectIdsState, [rootBotId]);
        set(webChatLogsState(rootBotId), []);
      });
      await findByText('Webchat Inspector');
    });

    it('should render unread error indicator as the tab is inactive. Once read, the error indicator needs to disappear.', async () => {
      const { findByTestId, rerender, queryByTestId } = renderWithRecoil(
        <WebChatLogItemHeader isActive={false} />,
        ({ set }) => {
          set(botProjectIdsState, [rootBotId]);
          set(projectMetaDataState(rootBotId), {
            isRootBot: true,
            isRemote: false,
          });
          set(webChatLogsState(rootBotId), [
            {
              timestamp: '2021-03-01 13:21:16',
              route: 'POST /v3/directline/conversations/36842e12-3ac5-446a-bafd-d073c2d8cb1d%7Clivechat/activities',
              logType: 'Error',
              status: 400,
              message: 'Error validating Microsoft App ID and Password',
              details: '',
            },
          ]);
        }
      );
      await findByTestId('DebugErrorIndicator');

      rerender(
        wrapWithRecoil(<WebChatLogItemHeader isActive />, ({ set }) => {
          set(botProjectIdsState, [rootBotId]);
          set(projectMetaDataState(rootBotId), {
            isRootBot: true,
            isRemote: false,
          });
          set(webChatLogsState(rootBotId), [
            {
              timestamp: '2021-03-01 13:21:16',
              route: 'POST /v3/directline/conversations/36842e12-3ac5-446a-bafd-d073c2d8cb1d%7Clivechat/activities',
              logType: 'Error',
              status: 400,
              message: 'Error validating Microsoft App ID and Password',
              details: '',
            },
          ]);
        })
      );
      expect(queryByTestId('DebugErrorIndicator')).toBeNull();
    });

    it('should not render unread error indicator as the tab is active', async () => {
      const { queryByTestId } = renderWithRecoil(<WebChatLogItemHeader isActive />, ({ set }) => {
        set(botProjectIdsState, [rootBotId]);
        set(projectMetaDataState(rootBotId), {
          isRootBot: true,
          isRemote: false,
        });
        set(webChatLogsState(rootBotId), [
          {
            timestamp: '2021-03-01 13:21:16',
            route: 'POST /v3/directline/conversations/36842e12-3ac5-446a-bafd-d073c2d8cb1d%7Clivechat/activities',
            logType: 'Error',
            status: 400,
            message: 'Error validating Microsoft App ID and Password',
            details: '',
          },
        ]);
      });
      expect(queryByTestId('DebugErrorIndicator')).toBeNull();
    });
  });
});
