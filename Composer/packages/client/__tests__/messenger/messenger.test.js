import Messenger from '../../src/messenger/Messenger';

const messenger = new Messenger();

describe('messenger', () => {
  it('should send message correctly', () => {
    let messageRecieved = '';

    const mockWindow = {
      postMessage: m => {
        messageRecieved = m;
      },
    };

    messenger.postMessage({ text: 'hi' }, mockWindow);
    expect(messageRecieved.text).toEqual('hi');
  });

  it('should be able to subscribe message', async () => {
    let messageRecieved = 0;
    const onMessage = () => {
      messageRecieved = messageRecieved + 1;
    };

    messenger.subscribe('test', onMessage);

    const mockEvent = {
      source: {
        postMessage: () => {},
      },
      data: {
        type: 'api_call',
        name: 'test',
      },
    };

    await messenger.receiveMessage(mockEvent);
    expect(messageRecieved).toBe(1);
    await messenger.receiveMessage(mockEvent);
    expect(messageRecieved).toBe(2);
  });

  it('should be able to subscribe message only once', async () => {
    let messageRecived = 0;
    const onMessage = () => {
      messageRecived = messageRecived + 1;
    };

    const mockEvent = {
      source: {
        postMessage: () => {},
      },
      data: {
        type: 'api_result',
        id: 'test', // once subscriber cares about id
      },
    };

    messenger.subscribeOnce('test', onMessage);

    await messenger.receiveMessage(mockEvent);
    expect(messageRecived).toBe(1);

    try {
      await messenger.receiveMessage(mockEvent);
      // error should be thrown.
      expect(true).toBe(false);
    } catch (err) {
      expect(err.message).toEqual('callback is null or not a function');
    }
  });
});
