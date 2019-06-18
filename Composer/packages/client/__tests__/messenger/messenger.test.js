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

  it('should be able to subscribe message', () => {
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

    messenger.receiveMessage(mockEvent);
    expect(messageRecieved).toBe(1);
    messenger.receiveMessage(mockEvent);
    expect(messageRecieved).toBe(2);
  });

  it('should be able to subscribe message only once', () => {
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

    messenger.receiveMessage(mockEvent);
    expect(messageRecived).toBe(1);

    expect(() => messenger.receiveMessage(mockEvent)).toThrow();
  });
});
