// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import toNumber from 'lodash/toNumber';
import { IExtensionRegistration } from '@botframework-composer/types'
import { mountConversationsRoutes } from './directline/mountConversationRoutes';
import { mountDirectLineRoutes } from './directline/mountDirectlineRoutes';
import DLServerContext from './directline/store/DLServerState';

function initialize(registration: IExtensionRegistration) {
  const preferredPort = toNumber(process.env.PORT) || 5000;
  const DLServerState = DLServerContext.getInstance(preferredPort);

  const conversationRouter = mountConversationsRoutes(DLServerState);
  const directlineRouter = mountDirectLineRoutes(DLServerState);

  conversationRouter.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, PATCH, OPTIONS');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-ms-bot-agent'
    );
    next?.();
  });

  directlineRouter.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, PATCH, OPTIONS');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-ms-bot-agent'
    );
    next?.();
  });

  registration.addRouter('/', conversationRouter);
  registration.addRouter('/', directlineRouter);

  registration.addWebRoute('get', '/okok', (req, res) => {
    res.status(200);
    res.send('ok??');
  })
}

module.exports = {
  initialize,
};
