import nanoid from 'nanoid';

import Messenger from './Messenger';

/**
 * Contruct an API layer on top of messenger, enable call api, register api to be called
 *
 * This is a layer shared by both Shell and ExtensionContainer
 */
const messenger = new Messenger();

class ApiClient {
  defaultEndpoint = window.parent;

  // helper function for any api call to shell
  apiCallAt = (apiName, args, endpoint) => {
    return new Promise((resolve, reject) => {
      const messageId = nanoid();

      messenger.subscribeOnce(messageId, (result, error) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });

      messenger.postMessage(
        {
          id: messageId,
          type: 'api_call',
          name: apiName,
          args: args,
        },
        endpoint
      );
    });
  };

  apiCall = (apiName, args) => {
    return this.apiCallAt(apiName, args, this.defaultEndpoint);
  };

  registerApi = (name, api) => {
    messenger.subscribe(name, api);
  };

  connect = () => {
    window.addEventListener('message', messenger.receiveMessage, false);
  };

  disconnect = () => {
    window.removeEventListener('message', messenger.receiveMessage, false);
  };
}

export default ApiClient;
