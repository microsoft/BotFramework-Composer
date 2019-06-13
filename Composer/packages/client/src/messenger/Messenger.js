/**
 * Messenger used to send\receive\listen\subscribe message
 *
 */
class Messenger {
  // NOTE: here the design is not generic, but we won't expand until later
  // api_result message.id => callback
  onceSubscribers = {};
  // api_call message.name => callback
  subscribers = {};

  postMessage = (message, window) => {
    window.postMessage(message, '*');
  };

  receiveMessage = event => {
    const message = event.data;

    if (message.type && message.type === 'api_result') {
      const callback = this.onceSubscribers[message.id];

      if (!message.error) {
        message.error = null;
      }
      callback(message.result, message.error);
      delete this.onceSubscribers[message.id];
    }

    if (message.type && message.type === 'api_call') {
      const callback = this.subscribers[message.name];
      const result = callback(message.args, event); // we pass args and the original event

      // if result is a promise, wait for it to resolve or reject
      if (result && typeof result.then === 'function') {
        result
          .then(res => {
            event.source.postMessage(
              {
                type: 'api_result',
                id: message.id,
                result: res,
              },
              '*'
            );
          })
          .catch(err => {
            event.source.postMessage(
              {
                type: 'api_result',
                id: message.id,
                error: err,
              },
              '*'
            );
          });
      } else {
        event.source.postMessage(
          {
            type: 'api_result',
            id: message.id,
            result: result,
          },
          '*'
        );
      }
    }
  };

  subscribeOnce = (messageId, callback) => {
    if (messageId in this.onceSubscribers) {
      // eslint-disable-next-line no-console
      console.error('Error: messageId should be unique');
    }
    this.onceSubscribers[messageId] = callback;
  };

  subscribe = (messageName, callback) => {
    this.subscribers[messageName] = callback;
  };
}

export default Messenger;
