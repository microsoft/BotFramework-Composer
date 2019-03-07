
import messenger from './Messenger'

class ShellApi {

    // helper function for any api call to shell
    apiCall = (apiName, args) => {
        messenger.postMessage({
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

    openSubEditor = (location, data, onChange) => {

    }

    saveValue = (data) => {
        messenger.postMessage({
            from: 'editor',
            command: 'save',
            data: data
        })
    }
}

export default ShellApi