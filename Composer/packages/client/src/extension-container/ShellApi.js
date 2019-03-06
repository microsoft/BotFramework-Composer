
import messenger from './Messenger'

class ShellApi {
    constructor() {
        this.postMessage = window.parent.postMessage.bind(window.parent); 
    }

    apiCall = (apiName, args) => {

        this.postMessage({
            id: 'uuid',
            type: 'api_call',
            name: apiName,
            args: args
        })

        return new Promise(function(resolve, reject) {
            messenger.subscribeOnce('uuid', function(result, error) {
                resolve(result);
            })
        })
    }

    getData = () => {
        return this.apiCall('getData', {});
    }

    loadSuccess = () => {
        this.postMessage({
            from: 'editor',
            command: 'onLoad',
        })
    }

    saveValue = (data) => {
        this.postMessage({
            from: 'editor',
            command: 'save',
            data: data
        })
    }
}

export default ShellApi