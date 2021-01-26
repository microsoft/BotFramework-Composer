// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import ReactWebChat from 'botframework-webchat';
import { useMemo, useEffect } from 'react';

import { ConversationService } from './ConversationService';

const conversationService = ConversationService();

export const WebChatPanel = (props: { botUrl: string }) => {
  const [directlineObj, setDirectline] = React.useState<any>(undefined);
  const user = useMemo(() => {
    return conversationService.getUser();
  }, []);

  useEffect(() => {
    async function fetchDLEssentials() {
      const resp: any = await conversationService.startConversation({
        botUrl: props.botUrl,
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
      conversationService.sendInitialActivity(resp.data.conversationId, [user]);
    }
    if (props.botUrl) {
      fetchDLEssentials();
    }
  }, []);

  if (!directlineObj) {
    return null;
  } else {
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
};
