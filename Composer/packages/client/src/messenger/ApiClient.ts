import nanoid from 'nanoid';

import Messenger, { MessageType, SubscriberFn } from './Messenger';

/**
 * Contruct an API layer on top of messenger, enable call api, register api to be called
 *
 * This is a layer shared by both Shell and ExtensionContainer
 */
const messenger = new Messenger();

class ApiClient {
  private defaultEndpoint = window.parent;

  // helper function for any api call to shell
  public apiCall = <T = any>(apiName: string, args?: any, endpoint: Window = this.defaultEndpoint): Promise<T> => {
    return new Promise((resolve, reject) => {
      const messageId = `${apiName}-${nanoid()}`;

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
          type: MessageType.CALL,
          name: apiName,
          args: args,
        },
        endpoint
      );
    });
  };

  public registerApi = (name: string, api: SubscriberFn) => {
    messenger.subscribe(name, api);
  };

  public connect = (target: Window = window) => {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    target.addEventListener('message', messenger.receiveMessage, false);
  };

  public disconnect = (target: Window = window) => {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    target.removeEventListener('message', messenger.receiveMessage, false);
  };
}

export default ApiClient;
