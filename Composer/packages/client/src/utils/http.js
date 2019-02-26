import axios from 'axios';

const baseUrl = 'http://localhost:5000/api/';

class httpClient {

    getFiles = (callback) => {
        axios.get(baseUrl + 'fileserver')
        .then((response) => {
            callback(response.data)
        }).catch(function(res){
            console.log(res);
        });
    }

    saveFile = (payload) => {
        axios.put(baseUrl + 'fileserver', payload)
        .then(res => {
            console.log("save success");
        })
        .catch(err => {
            console.log(err);
            console.log("save failed");
        });
        console.log(payload);
    }

    toggleBot = (status, callback) => {
        if (status === 'stopped') {
            axios.get(baseUrl + 'launcher/start')
            .then((response) => {
                callback('running');
            }).catch(function(res){
                console.log(res);
            });
          } else {
            axios.get(baseUrl + 'launcher/stop')
            .then((response) => {
                callback('stopped');
            }).catch(function(res){
                console.log(res);
            });
        }
    }
}

export default httpClient