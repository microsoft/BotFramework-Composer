import axios from 'axios';

const baseUrl = 'http://localhost:5000/api/';

class storageApi {
  getStorages = (callback, onError) => {
    axios
      .get(baseUrl + 'storages')
      .then(response => {
        callback(response.data);
      })
      .catch(function(res) {
        onError(res);
      });
  };

  getStorageById = (storageId, path, callback, onError) => {
    if (!storageId) {
      storageId = 'default';
    }

    axios
      .put(baseUrl + `/storages/${storageId}/blobs/${path}`)
      .then(res => {
        callback(res);
      })
      .catch(err => {
        onError(err);
      });
  };

  getFolderInfo = (path, callback, onError) => {
    axios
      .get(baseUrl + `fileserver/openbotFile?path=${path}`)
      .then(response => {
        callback(response.data);
      })
      .catch(function(res) {
        onError(res);
      });
  };
}

export default storageApi;
