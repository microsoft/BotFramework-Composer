import React, { useState, useEffect, Fragment } from 'react';

import ApiClient from '../messenger/ApiClient';

import getEditor from './EditorMap';

import './extensionContainer.css';
/**
 * ExtensionContainer is a IFrame container to host any extension as React component
 * ExtensionContainer provides a React absraction to it's inner extention, on top of the
 * underlying messaging api between ExtensionContainer and Shell
 *
 * An extension won't have to know this ExtensionContainer exists, it just use the props
 * passed into it to communite with Shell. Those props is actually implement in Container layer.
 *
 * The data and controls flows look like this
 *  Shell <---(messaging)---> Container <---(react props)---> Extension
 *
 */

const apiClient = new ApiClient();

var subEditorCallbacks = {};

function ExtensionContainer() {
  const [data, setData] = useState(null);

  useEffect(() => {
    apiClient.connect();

    apiClient.registerApi('reset', data => {
      setData(data);
    });

    apiClient.registerApi('saveFromChild', args => {
      var callback = subEditorCallbacks[args.from];
      if (callback) {
        callback(args.data);
      }
    });

    shellApi.getData().then(function(result) {
      setData(result);
    });

    return () => {
      apiClient.disconnect();
    };
  }, []);

  const shellApi = {
    getData: () => {
      return apiClient.apiCall('getData', {});
    },

    saveData: newData => {
      return apiClient.apiCall('saveData', newData);
    },

    openSubEditor: (location, data, onChange) => {
      apiClient.apiCall('openSubEditor', { location: location, data: data }).then(function(name) {
        subEditorCallbacks[name] = onChange;
        return name;
      });
    },
  };

  const RealEditor = getEditor(data);

  return (
    <Fragment>
      {RealEditor === '' ? '' : <RealEditor data={data} onChange={shellApi.saveData} shellApi={shellApi} />}
    </Fragment>
  );
}

export default ExtensionContainer;
