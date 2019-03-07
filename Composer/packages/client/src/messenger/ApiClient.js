
import Messenger from './Messenger'

class ApiClient {

    messenger = new Messenger();

    defaultEndpoint = window.parent;

    // helper function for any api call to shell
    apiCallAt = (apiName, args, endpoint) => {
    
        // generate a message ID each time
        // TODO: make this id absolute unique if necessary
        var mid = new Date().valueOf();

        this.messenger.postMessage({
            id: mid,
            type: 'api_call',
            name: apiName,
            args: args
        },
        endpoint
        )

        return new Promise((resolve, reject) => {
            this.messenger.subscribeOnce(mid, function(result, error) {
                resolve(result);
            })
        })
    }

    apiCall = (apiName, args) => {
        return this.apiCallAt(apiName, args, this.defaultEndpoint);
    }

    registerApi = (name, api) => {
        this.messenger.subscribe(name, api);
    }

    connect = () => {
        window.addEventListener('message', this.messenger.receiveMessage, false);
    }

    disconnect = () => {
        window.removeEventListener("message", this.messenger.receiveMessage, false);
    }
}

export default ApiClient