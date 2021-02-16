// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useMemo, useEffect, useState, useRef } from 'react';

import ConversationService, { ChatData, BotSecrets, User } from './utils/conversationService';
import { WebChatHeader } from './WebChatHeader';
import { WebChatContainer } from './WebChatContainer';

const BASEPATH = process.env.PUBLIC_URL || 'http://localhost:3000/';

export interface WebChatPanelProps {
  botUrl: string;
  secrets: BotSecrets;
  /** Directline host url. By default, set to Composer host url. */
  directlineHostUrl?: string;
  botName: string;
  projectId: string;
  isWebChatPanelVisible: boolean;
  activeLocale: string;
  appLifecycleHandler: any;
  openBotInEmulator: (projectId: string) => void;
}

export const WebChatPanel: React.FC<WebChatPanelProps> = ({
  projectId,
  botUrl,
  secrets,
  directlineHostUrl = BASEPATH,
  botName,
  isWebChatPanelVisible,
  openBotInEmulator,
  activeLocale,
}) => {
  const [chats, setChatData] = useState<Record<string, ChatData>>({});
  const [currentConversation, setCurrentConversation] = useState<string>('');
  const conversationService = useMemo(() => new ConversationService(directlineHostUrl), [directlineHostUrl]);
  const webChatPanelRef = useRef<HTMLDivElement>(null);
  const [isConversationStartQueued, queueConversationStart] = useState<boolean>(false);

  useEffect(() => {
    queueConversationStart(!!botUrl);
  }, [botUrl]);

  useEffect(() => {
    if (isWebChatPanelVisible && isConversationStartQueued) {
      const startConversation = async () => {
        const chatData: ChatData = await conversationService.startNewConversation(
          botUrl,
          secrets,
          projectId,
          activeLocale
        );

        setCurrentConversation(chatData.conversationId);
        setChatData({
          [chatData.conversationId]: chatData,
        });
      };
      startConversation();
      queueConversationStart(false);
    }
  }, [isWebChatPanelVisible]);

  const onRestartConversationClick = async (oldConversationId: string, requireNewUserId: boolean) => {
    const chatData = await conversationService.restartConversation(
      chats[oldConversationId],
      requireNewUserId,
      activeLocale
    );
    setCurrentConversation(chatData.conversationId);
    setChatData({
      [chatData.conversationId]: chatData,
    });
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

      webChatPanelRef.current?.removeChild(downloadLink);
    } catch (ex) {
      //TODO: Handle failed transcript download
    }
  };

  if (!chats[currentConversation]?.directline) {
    return null;
  }

  return (
    <div ref={webChatPanelRef}>
      <WebChatHeader
        conversationId={currentConversation}
        onRestartConversation={onRestartConversationClick}
        onSaveTranscript={onSaveTranscriptClick}
        openBotInEmulator={() => {
          openBotInEmulator(projectId);
        }}
      />
      <div data-testid="WebChat-Content" style={{ height: 'calc(100% - 36px)' }}>
        <WebChatContainer
          botUrl={botUrl}
          conversationService={conversationService}
          activeLocale={activeLocale}
          chatData={chats[currentConversation]}
          currentConversation={currentConversation}
          sendInitialActivity={(conversationId: string, currentUser: User) => {
            conversationService.sendInitialActivity(conversationId, [currentUser]);
          }}
        />
      </div>
    </div>
  );
};
