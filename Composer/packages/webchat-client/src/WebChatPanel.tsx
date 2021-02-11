// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useMemo, useEffect, useState, useRef } from 'react';
import ReactWebChat, { createStyleSet } from 'botframework-webchat';
import formatMessage from 'format-message';
import { createStore as createWebChatStore } from 'botframework-webchat-core';

import webChatStyleOptions from './utils/webChatTheme';
import { ChatData, ConversationService, BotSecrets } from './utils/ConversationService';
import { WebChatHeader } from './WebChatHeader';

const BASEPATH = process.env.PUBLIC_URL || 'http://localhost:3000/';

export interface WebChatPanelProps {
  botUrl: string;
  secrets: BotSecrets;
  /** Directline host url. By default, set to Composer host url. */
  directlineHostUrl?: string;
  botName: string;
  projectId: string;
  isPanelActive: boolean;
}

export const WebChatPanel: React.FC<WebChatPanelProps> = ({
  projectId,
  botUrl,
  secrets,
  directlineHostUrl = BASEPATH,
  botName,
  isPanelActive,
}) => {
  const [chats, setChatData] = useState<Record<string, ChatData>>({});
  const [currentConversation, setCurrentConversation] = useState<string>('');
  const conversationServiceRef = useRef<ConversationService>(new ConversationService(directlineHostUrl));
  const conversationService = conversationServiceRef.current;
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);
  const [isConversationStartQueued, queueConversationStart] = useState<boolean>(false);

  useEffect(() => {
    if (botUrl) {
      queueConversationStart(true);
    } else {
      queueConversationStart(false);
    }
  }, [botUrl]);

  useEffect(() => {
    if (isConversationStartQueued) {
      const startConversation = async () => {
        const chatData: ChatData = await conversationService.startNewConversation(botUrl, secrets, projectId);
        setCurrentConversation(chatData.conversationId);
        // Currently maintaining one conversation. In future we would have mulitple chats at the same time active.
        setChatData({
          [chatData.conversationId]: chatData,
        });
      };
      startConversation();
      queueConversationStart(false);
    }
  }, [isPanelActive]);

  const webchatContent = useMemo(() => {
    if (currentConversation) {
      const chatData = chats[currentConversation];
      conversationService.sendInitialActivity(currentConversation, [chatData.user]);

      const webchatStore = createWebChatStore({});
      const styleSet = createStyleSet({ ...webChatStyleOptions });

      return (
        <ReactWebChat
          key={chatData.conversationId}
          directLine={chatData.directline}
          disabled={!botUrl}
          store={webchatStore}
          styleSet={styleSet}
          userID={chatData.user.id}
        />
      );
    }
    return null;
  }, [chats]);

  const onRestartConversationClick = async (oldConversationId: string, requireNewUserId: boolean) => {
    const chatData = await conversationService.restartConversation(chats[oldConversationId], requireNewUserId);
    setCurrentConversation(chatData.conversationId);
    setChatData({
      [chatData.conversationId]: chatData,
    });
  };

  const onSaveTranscriptClick = async (conversationId: string) => {
    try {
      const downloadLink = downloadLinkRef.current;
      if (!downloadLink) return;

      const resp = await conversationService.getTranscriptsData(conversationId);
      const transcripts = resp.data;

      const blob = new Blob([JSON.stringify(transcripts, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      downloadLink.download = `${botName}.transcript`;
      downloadLink.href = url;
      downloadLink.click();
    } catch (ex) {
      //TODO: Handle failed transcript download
    }
  };

  if (!chats[currentConversation]?.directline) {
    return null;
  }

  return (
    <>
      <WebChatHeader
        conversationId={currentConversation}
        onRestartConversation={() => onRestartConversationClick(currentConversation, false)}
        onSaveTranscript={onSaveTranscriptClick}
        onStartNewConversation={() => onRestartConversationClick(currentConversation, true)}
      />
      <div data-testid="WebChat-Content" style={{ height: 'calc(100% - 36px)' }}>
        {webchatContent}
      </div>
      {/* A shadow download link to trigger browser native API on saving transcript JSON.  */}
      <a ref={downloadLinkRef} aria-hidden="true" href="#save" style={{ display: 'none' }}>
        {formatMessage('Save')}
      </a>
    </>
  );
};
