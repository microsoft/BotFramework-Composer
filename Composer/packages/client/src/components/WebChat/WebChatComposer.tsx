// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { createStyleSet, Components } from 'botframework-webchat';
import { CommunicationColors, NeutralColors } from '@fluentui/theme';

import { ConversationService } from './utils/conversationService';
import webChatStyleOptions from './utils/webChatTheme';
import { ChatData, ActivityType } from './types';
import { ActivityHighlightWrapper } from './ActivityHighlightWrapper';
import { WebChatHooksContainer } from './hooks/WebChatHooksContainer';

const { Composer, BasicWebChat } = Components;

export type WebChatComposerProps = {
  currentConversation: string;
  activeLocale: string;
  conversationService: ConversationService;
  botUrl: string;
  chatData: ChatData;
  isDisabled: boolean;
};

const createCardActionMiddleware =
  () =>
  (next) =>
  async ({ cardAction, getSignInUrl }) => {
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

const createActivityMiddleware =
  () =>
  (next: unknown) =>
  (...setupArgs) =>
  (...renderArgs) => {
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
            return (
              <ActivityHighlightWrapper activityId={card.activity.id}>
                {middlewareResult(...renderArgs)}
              </ActivityHighlightWrapper>
            );
          }
          return false;
        }
        return false;
    }
  };

const areEqual = (prevProps: WebChatComposerProps, nextProps: WebChatComposerProps) => {
  const result =
    prevProps.currentConversation === nextProps.currentConversation && prevProps.isDisabled === nextProps.isDisabled;
  return result;
};

export const WebChatComposer = React.memo((props: WebChatComposerProps) => {
  const { activeLocale, chatData, isDisabled, currentConversation } = props;

  if (!currentConversation || !chatData) {
    return null;
  }

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
    <Composer
      key={chatData.conversationId}
      activityMiddleware={createActivityMiddleware}
      cardActionMiddleware={createCardActionMiddleware}
      directLine={chatData.directline}
      disabled={isDisabled}
      locale={activeLocale}
      store={chatData.webChatStore}
      styleSet={styleSet}
      userID={chatData?.user.id}
    >
      <BasicWebChat />
      <WebChatHooksContainer />
    </Composer>
  );
}, areEqual);
