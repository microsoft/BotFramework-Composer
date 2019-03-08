/**
 * Messenger used to send\receive\listen\subscribe message
 * 
 */
class Messenger {

    // NOTE: here the design is not generic, but we won't expand until later
    // api_result message.id => callback
    onceSubscribers = {};
    // api_call message.name => callback
    subscribers = {}

    postMessage = (message, window) => {
        window.postMessage(message);
    }

    receiveMessage = (event) => {
        var message = event.data;
        
        if (message.type && message.type === "api_result") {
            var callback = this.onceSubscribers[message.id];

            if (!message.error) {
                message.error = null;
            }
            callback(message.result, message.error);
            delete this.onceSubscribers[message.id];
        }

        if (message.type && message.type === "api_call") {
            var callback = this.subscribers[message.name];
            var result = callback(message.args, event); // we pass args and the original event
            event.source.postMessage({
                type: "api_result",
                id: message.id,
                result: result
            })
        }
    }

    subscribeOnce = (messageId, callback) => {
        this.onceSubscribers[messageId] = callback;
    }

    subscribe = (messageName, callback) => {
        this.subscribers[messageName] = callback;
    }
}

export default Messenger