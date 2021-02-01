// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useMemo, useEffect } from 'react';
import ReactWebChat from 'botframework-webchat';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';

import { ConversationService } from './utils/ConversationService';

const conversationService = new ConversationService();

export interface WebChatPanelProps {
  botUrl: string;
}

export const WebChatPanel: React.FC<WebChatPanelProps> = ({ botUrl }) => {
  const [directlineObj, setDirectline] = React.useState<any>(undefined);
  const user = useMemo(() => {
    return conversationService.getUser();
  }, []);

  const handleRestartConversation = async (oldConversationId, requireNewConversationId) => {
    const chatObj = conversationService.getChatData(oldConversationId);
    let conversationId;
    if (requireNewConversationId) {
      conversationId = `${conversationService.generateUniqueId()}|${chatObj.chatMode}`;
    } else {
      conversationId = chatObj.conversationId || `${conversationService.generateUniqueId()}|${chatObj.chatMode}`;
    }
    chatObj.directline.end();

    const resp = await conversationService.conversationUpdate(oldConversationId, conversationId, chatObj.user.id);
    const { endpointId } = resp.data;
    const dl = await conversationService.fetchDirectLineObject(conversationId, {
      mode: 'conversation',
      endpointId: endpointId,
      userId: user.id,
    });
    setDirectline(dl);
  };

  async function fetchDLEssentials() {
    const resp: any = await conversationService.startConversation({
      botUrl,
      channelServiceType: 'public',
      members: [user],
      mode: 'conversation',
      msaAppId: '',
      msaPassword: '',
    });

    // await conversationService.conversationUpdate(resp.data.conversationId, user.id)
    const dl = await conversationService.fetchDirectLineObject(resp.data.conversationId, {
      mode: 'conversation',
      endpointId: resp.data.endpointId,
      userId: user.id,
    });
    setDirectline(dl);
  }

  useEffect(() => {
    fetchDLEssentials();
  }, []);

  const webchatMemo = useMemo(() => {
    if (directlineObj?.conversationId) {
      conversationService.sendInitialActivity(directlineObj.conversationId, [user]);
      conversationService.saveChatData({
        conversationId: directlineObj.conversationId,
        chatMode: 'conversation',
        directline: directlineObj,
        user,
      });
      return (
        <ReactWebChat
          key={directlineObj.conversationId}
          directLine={directlineObj}
          disabled={false}
          userID={user.id}
          username={'User'}
        />
      );
    }
    return null;
  }, [directlineObj]);

  if (!directlineObj) {
    return null;
  } else {
    return (
      <>
        <div>
          <DefaultButton type="button" onClick={() => handleRestartConversation(directlineObj.conversationId, false)}>
            {formatMessage('Restart with same')}
          </DefaultButton>
          <DefaultButton type="button" onClick={() => handleRestartConversation(directlineObj.conversationId, true)}>
            {formatMessage('Restart with new')}
          </DefaultButton>
        </div>
        {webchatMemo}
      </>
    );
  }
};
