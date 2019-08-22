type OnceSubscriberFn = (res: any, err: any) => any | Promise<any>;
export type SubscriberFn = (args: any, event: MessageEvent) => any | Promise<any>;

export enum MessageType {
  RESULT = 'api_result',
  CALL = 'api_call',
}

interface BaseMessage {
  type: MessageType;
  id: string;
}

interface ResultMessage extends BaseMessage {
  result?: any;
  error?: any;
}

interface CallMessage extends BaseMessage {
  name: string;
  args: any;
}

/**
 * Messenger used to send\receive\listen\subscribe message
 */
class Messenger {
  // NOTE: here the design is not generic, but we won't expand until later
  // api_result message.id => callback
  private onceSubscribers: { [id: string]: OnceSubscriberFn } = {};
  // api_call message.name => callback
  private subscribers: { [id: string]: SubscriberFn } = {};

  public postMessage = (message: ResultMessage | CallMessage, window: Window) => {
    window.postMessage(message, '*');
  };

  public receiveMessage = async (event: MessageEvent) => {
    const message = event.data as BaseMessage;

    if (message.type && message.type === MessageType.RESULT) {
      const resMsg = message as ResultMessage;
      const callback = this.onceSubscribers[resMsg.id];

      if (!callback || typeof callback !== 'function') {
        throw new Error('callback is null or not a function');
      }

      if (!resMsg.error) {
        resMsg.error = null;
      }
      await callback(resMsg.result, resMsg.error);
      delete this.onceSubscribers[message.id];
      return;
    }

    if (message.type && message.type === MessageType.CALL) {
      const callMsg = message as CallMessage;
      const callback = this.subscribers[callMsg.name];

      if (event.source) {
        const win = event.source as Window;
        try {
          const result = await callback(callMsg.args, event); // we pass args and the original event

          win.postMessage(
            {
              type: MessageType.RESULT,
              id: callMsg.id,
              result,
            },
            '*'
          );
        } catch (err) {
          win.postMessage(
            {
              type: MessageType.RESULT,
              id: callMsg.id,
              error: err.message,
            },
            '*'
          );
        }
      }
    }
  };

  public subscribeOnce = (messageId: string, callback: OnceSubscriberFn) => {
    if (messageId in this.onceSubscribers) {
      // eslint-disable-next-line no-console
      console.error('Error: messageId should be unique');
    }
    this.onceSubscribers[messageId] = callback;
  };

  public subscribe = (messageName: string, callback: SubscriberFn) => {
    this.subscribers[messageName] = callback;
  };
}

export default Messenger;
