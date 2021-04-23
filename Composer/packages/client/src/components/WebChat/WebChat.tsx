// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, { useEffect, useRef, useState } from 'react';
import { createStyleSet, hooks, Components } from 'botframework-webchat';
import { CommunicationColors, NeutralColors } from '@uifabric/fluent-theme';
import { useRecoilState } from 'recoil';

import { webChatScrollPositionState } from '../../recoilModel';

import { ConversationService } from './utils/conversationService';
import webChatStyleOptions from './utils/webChatTheme';
import { ChatData, ActivityType } from './types';
const { BasicWebChat, Composer } = Components;

export type WebChatProps = {
  currentConversation: string;
  activeLocale: string;
  conversationService: ConversationService;
  botUrl: string;
  chatData: ChatData;
  isDisabled: boolean;
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

const areEqual = (prevProps: WebChatProps, nextProps: WebChatProps) => {
  const result =
    prevProps.currentConversation === nextProps.currentConversation && prevProps.isDisabled === nextProps.isDisabled;
  return result;
};

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

const ScrollToLatest = () => {
  const scrollPositionRef = useRef();
  const [webChatScrollPosition, setScrollPosition] = useRecoilState(webChatScrollPositionState);
  const scrollTo = hooks.useScrollTo({});

  hooks.useObserveScrollPosition(
    (position) => {
      setScrollPosition({ ...position });
    },
    [scrollPositionRef]
  );

  useEffect(() => {
    if (webChatScrollPosition) {
      scrollTo(webChatScrollPosition);
    }
  }, []);

  return <></>;
};

export const WebChat = React.memo((props: WebChatProps) => {
  const { activeLocale, chatData, isDisabled, currentConversation, conversationService } = props;

  const [directlineObject, setDirectlineObject] = useState<any>(null);

  useEffect(() => {
    const getDirectlineObject = async () => {
      const directlineObject = await conversationService.fetchDirectLineObject(chatData.conversationId, {
        mode: chatData.webChatMode,
        userId: chatData.user.id,
        endpointId: chatData.endpointId,
      });
      setDirectlineObject(directlineObject);
    };
    if (!directlineObject && chatData) {
      getDirectlineObject();
      // scrollTo(webChatScrollPosition);
    }
  }, [currentConversation, chatData]);

  if (!currentConversation || !chatData || !directlineObject) {
    return null;
  }

  return (
    <Composer
      key={chatData.conversationId}
      activityMiddleware={createActivityMiddleware}
      cardActionMiddleware={createCardActionMiddleware}
      directLine={directlineObject}
      disabled={isDisabled}
      locale={activeLocale}
      store={chatData.webChatStore}
      styleSet={styleSet}
      userID={chatData?.user.id}
    >
      <BasicWebChat />
      <ScrollToLatest />
    </Composer>
  );
}, areEqual);
