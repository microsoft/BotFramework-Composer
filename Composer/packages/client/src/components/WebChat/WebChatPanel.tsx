// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useMemo, useEffect, useState, useRef, useCallback } from 'react';
import { useRecoilValue } from 'recoil';
import {
  ConversationActivityTraffic,
  ConversationNetworkTrafficItem,
  ConversationNetworkErrorItem,
} from '@botframework-composer/types';
import { AxiosResponse } from 'axios';
import formatMessage from 'format-message';
import { v4 as uuid } from 'uuid';
import throttle from 'lodash/throttle';

import TelemetryClient from '../../telemetry/TelemetryClient';
import { BotStatus } from '../../constants';
import { dispatcherState } from '../../recoilModel';

import { ConversationService } from './utils/conversationService';
import { WebChatHeader } from './WebChatHeader';
import { WebChatComposer } from './WebChatComposer';
import { BotSecret, ChatData, RestartOption } from './types';

const BASEPATH = process.env.PUBLIC_URL || 'http://localhost:3000/';
// TODO: Refactor to include Webchat header component as a part of WebchatComposer to avoid this variable.
const webChatHeaderHeight = '85px';

export interface WebChatPanelProps {
  botData: {
    projectId: string;
    botUrl: string;
    secret: BotSecret;
    botName: string;
    activeLocale: string;
    botStatus: BotStatus;
  };
  /** Directline host url. By default, set to Composer host url. */
  directlineHostUrl?: string;
  isWebChatPanelVisible: boolean;
}

export const WebChatPanel: React.FC<WebChatPanelProps> = ({
  directlineHostUrl = BASEPATH,
  botData,
  isWebChatPanelVisible,
}) => {
  const {
    openBotInEmulator,
    appendWebChatTraffic,
    clearWebChatLogs,
    setDebugPanelExpansion,
    setActiveTabInDebugPanel,
    setWebChatPanelVisibility,
  } = useRecoilValue(dispatcherState);
  const { projectId, botUrl, secret, botName, activeLocale, botStatus } = botData;
  const [chats, setChatData] = useState<Record<string, ChatData>>({});
  const [currentConversation, setCurrentConversation] = useState<string>('');
  const [currentRestartOption, onSetRestartOption] = useState<RestartOption>(RestartOption.NewUserID);
  const [isRestartButtonDisabled, setIsRestartButtonDisabled] = useState(false);
  const conversationService = useMemo(() => new ConversationService(directlineHostUrl), [directlineHostUrl]);
  const webChatPanelRef = useRef<HTMLDivElement>(null);
  const webChatTrafficChannel = useRef<WebSocket>();

  useEffect(() => {
    const bootstrapChat = async () => {
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

    // we can't log traffic in the demo because we are no longer going through the mock DL channel
    //bootstrapChat();

    return () => {
      webChatTrafficChannel.current?.close();
    };
  }, []);

  useEffect(() => {
    if (botUrl) {
      setCurrentConversation('');
    }
  }, [botUrl]);

  useEffect(() => {
    // NOTE: for the pva 2 demo
    //setIsRestartButtonDisabled(botStatus !== BotStatus.connected);
  }, [botStatus]);

  const sendInitialActivities = async (chatData: ChatData) => {
    try {
      // we don't need to send the activities for the demo
      //await conversationService.sendInitialActivity(chatData.conversationId, [chatData.user]);
    } catch (ex) {
      // DL errors are handled through socket above.
    }
  };

  const setConversationData = async (chatData: ChatData) => {
    setChatData({
      [chatData.conversationId]: chatData,
    });
    setCurrentConversation(chatData.conversationId);
  };

  useEffect(() => {
    let mounted = true;
    if (isWebChatPanelVisible && !currentConversation) {
      const startConversation = async () => {
        const chatData: ChatData = await conversationService.startNewConversation(
          botUrl,
          secret,
          projectId,
          activeLocale
        );
        if (mounted) {
          setChatData({
            [chatData.conversationId]: chatData,
          });
          setCurrentConversation(chatData.conversationId);
          setConversationData(chatData);
          sendInitialActivities(chatData);
        }
      };
      startConversation();
    }

    return () => {
      mounted = false;
    };
  }, [isWebChatPanelVisible]);

  const handleThrottledRestart: (oldChatData: ChatData, requireNewUserId: boolean) => void = useCallback(
    throttle(
      async (oldChatData: ChatData, requireNewUserId: boolean) => {
        try {
          setIsRestartButtonDisabled(true);
          const chatData = await conversationService.restartConversation(
            oldChatData,
            requireNewUserId,
            activeLocale,
            secret,
            projectId
          );

          TelemetryClient.track('WebChatConversationRestarted', {
            restartType: requireNewUserId ? 'NewUserId' : 'SameUserId',
          });

          setConversationData(chatData);
          sendInitialActivities(chatData);
          clearWebChatLogs(projectId);
        } catch (ex) {
          // DL errors are handled through socket above.
        } finally {
          setIsRestartButtonDisabled(false);
        }
      },
      1000,
      { leading: true }
    ),
    [secret, activeLocale]
  );

  const onSaveTranscriptClick = async (conversationId: string) => {
    try {
      const downloadLink = document.createElement('a');
      downloadLink.style.display = 'none';
      webChatPanelRef.current?.appendChild(downloadLink);
      const resp = await conversationService.getTranscriptsData(conversationId);
      const transcripts = resp.data;
      downloadLink.click();

      const blob = new Blob([JSON.stringify(transcripts, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      downloadLink.download = `${botName}.transcript`;
      downloadLink.href = url;
      downloadLink.click();
      TelemetryClient.track('SaveTranscriptClicked');
      webChatPanelRef.current?.removeChild(downloadLink);
    } catch (ex) {
      const err: ConversationNetworkErrorItem = {
        error: {
          message: formatMessage('An error occurred saving transcripts'),
        },
        id: uuid(),
        request: { route: 'saveTranscripts/', method: '', payload: {} },
        response: { payload: ex, statusCode: 400 },
        timestamp: Date.now(),
        trafficType: 'networkError',
      };
      appendWebChatTraffic(projectId, err);
    }
  };

  return (
    <div ref={webChatPanelRef} style={{ height: `calc(100% - ${webChatHeaderHeight})` }}>
      <WebChatHeader
        botName={botName}
        conversationId={currentConversation}
        currentRestartOption={currentRestartOption}
        isRestartButtonDisabled={isRestartButtonDisabled}
        onCloseWebChat={() => {
          setWebChatPanelVisibility(false);
          TelemetryClient.track('WebChatPaneClosed');
        }}
        onOpenBotInEmulator={() => {
          openBotInEmulator(projectId);
          TelemetryClient.track('EmulatorButtonClicked', { isRoot: true, projectId, location: 'WebChatPane' });
        }}
        onRestartConversation={(oldConversationId: string, requireNewUserId: boolean) =>
          handleThrottledRestart(chats[oldConversationId], requireNewUserId)
        }
        onSaveTranscript={onSaveTranscriptClick}
        onSetRestartOption={onSetRestartOption}
      />
      <WebChatComposer
        activeLocale={activeLocale}
        botUrl={botUrl}
        chatData={chats[currentConversation]}
        conversationService={conversationService}
        currentConversation={currentConversation}
        isDisabled={false /*botStatus !== BotStatus.connected*/}
      />
    </div>
  );
};
