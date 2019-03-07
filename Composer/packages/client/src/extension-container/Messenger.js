/**
 * Messenger in extension side, used to send\receive message
 */
class Messenger {
    constructor() {
        this.postMessage = window.parent.postMessage.bind(window.parent); 
    }

    // id => callback
    subscribers = {};

    receiveMessage = (event) => {
        var message = event.data;
        
        if (message.type && message.type === "api_result") {
            var callback = this.subscribers[message.id];

            if (!message.error) {
                message.error = null;
            }
            callback(message.result, message.error);
            delete this.subscribers[message.id];
        }
    }

    subscribeOnce = function(messageId, callback) {
        this.subscribers[messageId] = callback;
    }
}


const messenger = new Messenger();

export default messenger;