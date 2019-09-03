import Messenger, { MessageType } from '../../src/messenger/Messenger';

const messenger = new Messenger();

// @ts-ignore
const mockWindow = new Window({ parsingMode: 'html' });
mockWindow.postMessage = jest.fn();

describe('messenger', () => {
  it('should send message correctly', () => {
    let messageRecieved: { id?: string } = {};

    const mockWindow = ({
      postMessage: m => {
        messageRecieved = m;
      },
    } as unknown) as Window;

    messenger.postMessage({ type: MessageType.RESULT, id: 'foo' }, mockWindow);
    expect(messageRecieved.id).toEqual('foo');
  });

  it('should be able to subscribe message', async () => {
    let messageRecieved = 0;
    const onMessage = () => {
      messageRecieved = messageRecieved + 1;
    };

    messenger.subscribe('test', onMessage);

    const mockEvent = ({
      source: mockWindow,
      data: {
        type: 'api_call',
        name: 'test',
      },
    } as unknown) as MessageEvent;

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

    const mockEvent = ({
      source: mockWindow,
      data: {
        type: 'api_result',
        id: 'test', // once subscriber cares about id
      },
    } as unknown) as MessageEvent;

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
