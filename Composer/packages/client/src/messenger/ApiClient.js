import nanoid from 'nanoid';

import Messenger from './Messenger';

/**
 * Contruct an API layer on top of messenger, enable call api, register api to be called
 *
 * This is a layer shared by both Shell and ExtensionContainer
 */

class ApiClient {
  messenger = new Messenger();

  defaultEndpoint = window.parent;

  // helper function for any api call to shell
  apiCallAt = (apiName, args, endpoint) => {
    const messsageId = nanoid();

    this.messenger.postMessage(
      {
        id: messsageId,
        type: 'api_call',
        name: apiName,
        args: args,
      },
      endpoint
    );

    return new Promise(resolve => {
      this.messenger.subscribeOnce(messsageId, function(result) {
        resolve(result);
      });
    });
  };

  apiCall = (apiName, args) => {
    return this.apiCallAt(apiName, args, this.defaultEndpoint);
  };

  registerApi = (name, api) => {
    this.messenger.subscribe(name, api);
  };

  connect = () => {
    window.addEventListener('message', this.messenger.receiveMessage, false);
  };

  disconnect = () => {
    window.removeEventListener('message', this.messenger.receiveMessage, false);
  };
}

export default ApiClient;
