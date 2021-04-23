// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useEffect, useMemo, useRef } from 'react';
import {
  ConversationActivityTraffic,
  ConversationNetworkTrafficItem,
  ConversationNetworkErrorItem,
} from '@botframework-composer/types';
import { useRecoilValue } from 'recoil';
import { v4 as uuid } from 'uuid';
import { AxiosResponse } from 'axios';
import formatMessage from 'format-message';

import { dispatcherState } from '../../recoilModel';

import { ConversationService } from './utils/conversationService';

export const useDirectLineServer = (projectId: string, directlineHostUrl: string) => {
  const webChatTrafficChannel = useRef<WebSocket>();
  const { appendWebChatTraffic, setDebugPanelExpansion, setActiveTabInDebugPanel } = useRecoilValue(dispatcherState);

  const conversationService = useMemo(() => new ConversationService(directlineHostUrl), [directlineHostUrl]);

  useEffect(() => {
    const bootstrapDirectLineServer = async () => {
      const conversationServerPort = await conversationService.setUpConversationServer();
      try {
        // set up Web Chat traffic listener
        webChatTrafficChannel.current = new WebSocket(`ws://localhost:${conversationServerPort}/ws/traffic`);
        if (webChatTrafficChannel.current) {
          webChatTrafficChannel.current.onmessage = (event) => {
            const data:
              | ConversationActivityTraffic
              | ConversationNetworkTrafficItem
              | ConversationNetworkErrorItem = JSON.parse(event.data);

            switch (data.trafficType) {
              case 'network': {
                appendWebChatTraffic(projectId, data);
                break;
              }
              case 'activity': {
                appendWebChatTraffic(
                  projectId,
                  data.activities.map((a) => ({
                    activity: a,
                    id: uuid(),
                    timestamp: new Date(a.timestamp || Date.now()).getTime(),
                    trafficType: data.trafficType,
                  }))
                );
                break;
              }
              case 'networkError': {
                appendWebChatTraffic(projectId, data);
                setTimeout(() => {
                  setActiveTabInDebugPanel('WebChatInspector');
                  setDebugPanelExpansion(true);
                }, 300);
                break;
              }
              default:
                break;
            }
          };
        }
      } catch (ex) {
        const response: AxiosResponse = ex.response;
        const err: ConversationNetworkErrorItem = {
          error: {
            message: formatMessage('An error occurred connecting initializing the DirectLine server'),
          },
          id: uuid(),
          request: { route: 'conversations/ws/port', method: 'GET', payload: {} },
          response: { payload: response.data, statusCode: response.status },
          timestamp: Date.now(),
          trafficType: 'networkError',
        };
        appendWebChatTraffic(projectId, err);
        setActiveTabInDebugPanel('WebChatInspector');
        setDebugPanelExpansion(true);
      }
    };

    bootstrapDirectLineServer();

    return () => {
      webChatTrafficChannel.current?.close();
    };
  }, []);
};
