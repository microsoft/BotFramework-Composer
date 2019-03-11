import axios from 'axios';

const baseUrl = 'http://localhost:5000/api/';

class httpClient {
  getFiles = (callback, onError) => {
    axios
      .get(baseUrl + 'fileserver')
      .then(response => {
        callback(response.data);
      })
      .catch(function(res) {
        onError(res);
      });
  };

  saveFile = (payload, callback, onError) => {
    axios
      .put(baseUrl + 'fileserver', payload)
      .then(res => {
        callback(res);
      })
      .catch(err => {
        onError(err);
      });
  };

  openbotFile = (path, callback, onError) => {
    axios
      .get(baseUrl + `fileserver/openbotFile?path=${path}`)
      .then(response => {
        callback(response.data);
      })
      .catch(function(res) {
        onError(res);
      });
  };

  toggleBot = (status, callback, onError) => {
    if (status === 'stopped') {
      axios
        .get(baseUrl + 'launcher/start')
        .then(() => {
          callback('running');
        })
        .catch(function(res) {
          onError(res);
        });
    } else {
      axios
        .get(baseUrl + 'launcher/stop')
        .then(() => {
          callback('stopped');
        })
        .catch(function(res, onError) {
          onError(res);
        });
    }
  };
}

export default httpClient;
