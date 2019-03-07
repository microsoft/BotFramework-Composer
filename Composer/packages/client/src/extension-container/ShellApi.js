
import messenger from './Messenger'

class ShellApi {

    // helper function for any api call to shell
    apiCall = (apiName, args) => {

        // generate a message ID each time
        // TODO: make this id absolute unique if necessary
        var mid = new Date().valueOf();

        messenger.postMessage({
            id: mid,
            type: 'api_call',
            name: apiName,
            args: args
        })

        return new Promise(function(resolve, reject) {
            messenger.subscribeOnce(mid, function(result, error) {
                resolve(result);
            })
        })
    }

    getData = () => {
        return this.apiCall('getData', {});
    }

    saveValue = (data) => {
       return this.apiCall('saveData', data);
    }
}

export default ShellApi