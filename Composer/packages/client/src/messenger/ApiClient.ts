/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
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
