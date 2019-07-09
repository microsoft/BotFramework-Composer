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

  receiveMessage = async event => {
    const message = event.data;

    if (message.type && message.type === 'api_result') {
      const callback = this.onceSubscribers[message.id];

      if (!callback || typeof callback !== 'function') {
        throw new Error('callback is null or not a function');
      }

      if (!message.error) {
        message.error = null;
      }
      await callback(message.result, message.error);
      delete this.onceSubscribers[message.id];
      return;
    }

    if (message.type && message.type === 'api_call') {
      const callback = this.subscribers[message.name];

      try {
        const result = await callback(message.args, event); // we pass args and the original event

        event.source.postMessage(
          {
            type: 'api_result',
            id: message.id,
            result,
          },
          '*'
        );
      } catch (err) {
        event.source.postMessage(
          {
            type: 'api_result',
            id: message.id,
            error: err.message,
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
