// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useMemo, useEffect, useState, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import { ConversationNetworkErrorItem } from '@botframework-composer/types';
import formatMessage from 'format-message';
import { v4 as uuid } from 'uuid';

import TelemetryClient from '../../telemetry/TelemetryClient';
import { BotStatus } from '../../constants';
import { currentWebChatConversationState, dispatcherState, webChatDataState } from '../../recoilModel';

import { ConversationService } from './utils/conversationService';
import { WebChatHeader } from './WebChatHeader';
import { WebChat } from './WebChat';
import { RestartOption } from './type';
import { BotSecrets, ChatData } from './types';

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
    setWebChatData: setChatData,
    setCurrentConversation,
  } = useRecoilValue(dispatcherState);

  const currentConversation = useRecoilValue(currentWebChatConversationState);
  const chats = useRecoilValue(webChatDataState);

  const { projectId, botUrl, secrets, botName, activeLocale, botStatus } = botData;

  const conversationService = useMemo(() => new ConversationService('http://localhost:3000/'), [directlineHostUrl]);

  const webChatPanelRef = useRef<HTMLDivElement>(null);
  const [currentRestartOption, onSetRestartOption] = useState<RestartOption>(RestartOption.NewUserID);

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
      console.log('Im inside here');
      const startConversation = async () => {
        const chatData: ChatData = await conversationService.startNewConversation(
          botUrl,
          secrets,
          projectId,
          activeLocale
        );
        if (mounted) {
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
      clearWebChatLogs(projectId);
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
    <div ref={webChatPanelRef} style={{ height: 'calc(100% - 85px)', zIndex: 1 }}>
      <WebChatHeader
        botName={botData.botName}
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
      <WebChat
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
