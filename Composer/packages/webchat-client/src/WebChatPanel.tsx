// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useMemo, useEffect, useState, useRef } from 'react';
import ReactWebChat, { createStyleSet } from 'botframework-webchat';
import formatMessage from 'format-message';
import { createStore as createWebChatStore } from 'botframework-webchat-core';
import { CommunicationColors, NeutralColors } from '@uifabric/fluent-theme';

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
  appLifecycleHandler,
}) => {
  const [chats, setChatData] = useState<Record<string, ChatData>>({});
  const [currentConversation, setCurrentConversation] = useState<string>('');
  const conversationServiceRef = useRef<ConversationService>(new ConversationService(directlineHostUrl));
  const conversationService = conversationServiceRef.current;
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);
  const [isConversationStartQueued, queueConversationStart] = useState<boolean>(false);
  const ipcRenderer = useRef<any>(appLifecycleHandler);

  useEffect(() => {
    ipcRenderer.current?.on('conversation-cleanup', () => {
      conversationService.cleanupAll();
    });
  }, []);

  useEffect(() => {
    if (botUrl) {
      queueConversationStart(true);
    } else {
      queueConversationStart(false);
    }
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
        // Currently maintaining one conversation. In future we would have mulitple chats at the same time active.
        setChatData({
          [chatData.conversationId]: chatData,
        });
      };
      startConversation();
      queueConversationStart(false);
    }
  }, [isWebChatPanelVisible]);

  const webchatContent = useMemo(() => {
    if (currentConversation) {
      const chatData = chats[currentConversation];
      conversationService.sendInitialActivity(currentConversation, [chatData.user]);

      const webchatStore = createWebChatStore({});
      const styleSet = createStyleSet({ ...webChatStyleOptions });
      styleSet.fileContent = {
        ...styleSet.fileContent,
        background: `${NeutralColors.white}`,
        '& .webchat__fileContent__fileName': {
          color: `${CommunicationColors.primary}`,
        },
        '& .webchat__fileContent__size': {
          color: `${NeutralColors.white}`,
        },
        '& .webchat__fileContent__downloadIcon': {
          fill: `${NeutralColors.white}`,
        },
        '& .webchat__fileContent__badge': {
          padding: '4px',
        },
      };

      return (
        <ReactWebChat
          key={chatData.conversationId}
          directLine={chatData.directline}
          disabled={!botUrl}
          store={webchatStore}
          styleSet={styleSet}
          userID={chatData.user.id}
          activityMiddleware={conversationService.createActivityMiddleware}
          cardActionMiddleware={conversationService.createCardActionMiddleware}
          locale={activeLocale}
        />
      );
    }
    return null;
  }, [chats]);

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
        onRestartConversation={onRestartConversationClick}
        onSaveTranscript={onSaveTranscriptClick}
        openBotInEmulator={() => {
          openBotInEmulator(projectId);
        }}
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
