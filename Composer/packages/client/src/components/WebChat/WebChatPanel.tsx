// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useMemo, useEffect, useState, useRef } from 'react';
import { DirectLineLog } from '@botframework-composer/types';
import { AxiosResponse } from 'axios';
import formatMessage from 'format-message';

import TelemetryClient from '../../telemetry/TelemetryClient';
import { BotStatus } from '../../constants';

import { ConversationService, ChatData, BotSecrets, getDateTimeFormatted } from './utils/conversationService';
import { WebChatHeader } from './WebChatHeader';
import { WebChatContainer } from './WebChatContainer';
import { RestartOption } from './type';

const BASEPATH = process.env.PUBLIC_URL || 'http://localhost:3000/';

export interface WebChatPanelProps {
  botData: {
    projectId: string;
    botUrl: string;
    secrets: BotSecrets;
    botName: string;
    activeLocale: string;
    botStatus: BotStatus;
  };
  /** Directline host url. By default, set to Composer host url. */
  directlineHostUrl?: string;
  isWebChatPanelVisible: boolean;
  appendLogToWebChatInspector: (projectId: string, log: DirectLineLog) => void;
  clearWebchatInspectorLogs: (projectId: string) => void;
  openBotInEmulator: (projectId: string) => void;
}

export const WebChatPanel: React.FC<WebChatPanelProps> = ({
  directlineHostUrl = BASEPATH,
  botData,
  isWebChatPanelVisible,
  openBotInEmulator,
  appendLogToWebChatInspector,
  clearWebchatInspectorLogs,
}) => {
  const { projectId, botUrl, secrets, botName, activeLocale, botStatus } = botData;
  const [chats, setChatData] = useState<Record<string, ChatData>>({});
  const [currentConversation, setCurrentConversation] = useState<string>('');
  const conversationService = useMemo(() => new ConversationService(directlineHostUrl), [directlineHostUrl]);
  const webChatPanelRef = useRef<HTMLDivElement>(null);
  const [currentRestartOption, onSetRestartOption] = useState<RestartOption>(RestartOption.NewUserID);
  const directLineErrorChannel = useRef<WebSocket>();

  useEffect(() => {
    const bootstrapChat = async () => {
      const conversationServerPort = await conversationService.setUpConversationServer();
      try {
        directLineErrorChannel.current = new WebSocket(
          `ws://localhost:${conversationServerPort}/ws/errors/createErrorChannel`
        );
        if (directLineErrorChannel.current) {
          directLineErrorChannel.current.onmessage = (event) => {
            const data: DirectLineLog = JSON.parse(event.data);
            appendLogToWebChatInspector(projectId, data);
          };
        }
      } catch (ex) {
        const response: AxiosResponse = ex.response;
        const err: DirectLineLog = {
          timestamp: getDateTimeFormatted(),
          route: 'conversations/ws/port',
          status: response.status,
          logType: 'Error',
          message: formatMessage('An error occurred connecting initializing the DirectLine server'),
        };
        appendLogToWebChatInspector(projectId, err);
      }
    };

    bootstrapChat();

    return () => {
      directLineErrorChannel.current?.close();
    };
  }, []);

  const sendInitialActivities = async (chatData: ChatData) => {
    try {
      await conversationService.sendInitialActivity(chatData.conversationId, [chatData.user]);
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
          secrets,
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

  const onRestartConversationClick = async (oldConversationId: string, requireNewUserId: boolean) => {
    try {
      TelemetryClient.track('WebChatConversationRestarted', {
        restartType: requireNewUserId ? 'NewUserId' : 'SameUserId',
      });
      const chatData = await conversationService.restartConversation(
        chats[oldConversationId],
        requireNewUserId,
        activeLocale,
        secrets
      );
      setConversationData(chatData);
      sendInitialActivities(chatData);
      clearWebchatInspectorLogs(projectId);
    } catch (ex) {
      // DL errors are handled through socket above.
    }
  };

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
      const err: DirectLineLog = {
        timestamp: getDateTimeFormatted(),
        route: 'saveTranscripts/',
        status: 400,
        logType: 'Error',
        message: formatMessage('An error occurred saving transcripts'),
        details: ex.message,
      };
      appendLogToWebChatInspector(projectId, err);
    }
  };

  return (
    <div ref={webChatPanelRef} style={{ height: 'calc(100% - 38px)' }}>
      <WebChatHeader
        conversationId={currentConversation}
        currentRestartOption={currentRestartOption}
        openBotInEmulator={() => {
          openBotInEmulator(projectId);
          TelemetryClient.track('EmulatorButtonClicked', { isRoot: true, projectId, location: 'WebChatPane' });
        }}
        onRestartConversation={onRestartConversationClick}
        onSaveTranscript={onSaveTranscriptClick}
        onSetRestartOption={onSetRestartOption}
      />
      <WebChatContainer
        activeLocale={activeLocale}
        botUrl={botUrl}
        chatData={chats[currentConversation]}
        conversationService={conversationService}
        currentConversation={currentConversation}
        isDisabled={botStatus !== BotStatus.connected}
      />
    </div>
  );
};
