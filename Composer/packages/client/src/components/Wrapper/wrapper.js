import axios from 'axios';

//Git token：70361ac666c30f15ab9e5b4774951662851c007c

const baseUrl = 'http://localhost:5000/api/';

/* ========FileSystem API======== */

//storage API wrappers
class apiWrapper {
  getStorage = (callback, onError) => {
    const destinationUrl = baseUrl + 'storages/';

    axios
      .get(destinationUrl)
      .then(response => {
        const storages = response.data;
        /*const listOfStorage = {};

        //Run through all files in the response.data list
        for (const index in storages) {
          const file = {
            id: storages[index].id,
            name: storages[index].name,
          };
          listOfStorage[index] = file;
        }

        callback(listOfStorage);*/
        callback(storages);
      })
      .catch(function(error) {
        onError(error);
      });
  };

  //blob API wrappers
  getFileOrFolder = (storageID, _path, callback, onError) => {
    const destinationUrl = baseUrl + 'storages/' + storageID + '/blobs/' + _path;

    axios
      .get(destinationUrl)
      .then(response => {
        const res = response.data;

        callback(res);
      })
      .catch(function(error) {
        onError(error);
      });
  };

  /* ========ProjectManagement API======== */
  //ProjectManagement API wrappers
  getOpenedProject = (callback, onError) => {
    const destinationUrl = baseUrl + 'projects/opened';

    axios
      .get(destinationUrl)
      .then(response => {
        const res = response.data;

        callback(res);
      })
      .catch(function(error) {
        onError(error);
      });
  };

  postNewProject = (desiredPath, callback, onError) => {
    const destinationUrl = baseUrl + 'projects/opened';

    axios
      .post(destinationUrl, {
        path: desiredPath,
      })
      .then(response => {
        const res = response.data;
        callback(res);
      })
      .catch(function(error) {
        onError(error);
      });
  };
}

export default apiWrapper;
