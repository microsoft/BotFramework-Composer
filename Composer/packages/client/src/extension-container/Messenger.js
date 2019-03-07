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
            callback(message.result, null);
        }

    }

    subscribeOnce = function(messageId, callback) {
        this.subscribers[messageId] = callback;
    }
}


const messenger = new Messenger();

export default messenger;