// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import ReactWebChat, { createStyleSet } from 'botframework-webchat';
import { createStore as createWebChatStore } from 'botframework-webchat-core';
import { CommunicationColors, NeutralColors } from '@uifabric/fluent-theme';

import ConversationService, { ActivityType, ChatData, User } from './utils/conversationService';
import webChatStyleOptions from './utils/webChatTheme';

type WebChatContainerProps = {
  currentConversation: string;
  activeLocale: string;
  conversationService: ConversationService;
  botUrl: string;
  chatData: ChatData;
  sendInitialActivity: (conversationId: string, user: User) => void;
};

const createCardActionMiddleware = () => (next) => async ({ cardAction, getSignInUrl }) => {
  const { type, value } = cardAction;

  switch (type) {
    case 'signin': {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const popup = window.open();
      const url = await getSignInUrl();
      if (popup) {
        popup.location.href = url;
      }
      break;
    }

    case 'downloadFile':
    //Fall through

    case 'playAudio':
    //Fall through

    case 'playVideo':
    //Fall through

    case 'showImage':
    //Fall through

    case 'openUrl':
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      window.open(value, '_blank');
      break;

    default:
      return next({ cardAction, getSignInUrl });
  }
};

const createActivityMiddleware = () => (next: unknown) => (...setupArgs) => (...renderArgs) => {
  const card = setupArgs[0];
  switch (card.activity.type) {
    case ActivityType.Trace:
      return false;

    case ActivityType.EndOfConversation:
      return false;

    default:
      if (typeof next === 'function') {
        const middlewareResult = next(...setupArgs);
        if (middlewareResult) {
          return middlewareResult(...renderArgs);
        }
        return false;
      }
      return false;
  }
};

const areEqual = (prevProps: WebChatContainerProps, nextProps: WebChatContainerProps) =>
  prevProps.currentConversation === nextProps.currentConversation;

export const WebChatContainer = React.memo((props: WebChatContainerProps) => {
  const { currentConversation, botUrl, activeLocale, chatData, sendInitialActivity } = props;
  if (currentConversation) {
    sendInitialActivity(currentConversation, chatData.user);

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
        activityMiddleware={createActivityMiddleware}
        cardActionMiddleware={createCardActionMiddleware}
        directLine={chatData.directline}
        disabled={!botUrl}
        locale={activeLocale}
        store={webchatStore}
        styleSet={styleSet}
        userID={chatData.user.id}
      />
    );
  }
  return null;
}, areEqual);
