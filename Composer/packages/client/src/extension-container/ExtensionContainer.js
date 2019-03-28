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

const subEditorCallbacks = {};

function ExtensionContainer() {
  const [data, setData] = useState('');
  const [dialogs, setDialogs] = useState([]);

  useEffect(() => {
    apiClient.connect();

    apiClient.registerApi('reset', data => {
      setData(data);
    });

    apiClient.registerApi('saveFromChild', args => {
      const callback = subEditorCallbacks[args.from];
      if (callback) {
        callback(args.data);
      }
    });

    shellApi.getData().then(result => {
      setData(result);
    });
    shellApi.getDialogs().then(result => {
      setDialogs(result);
    });

    return () => {
      apiClient.disconnect();
    };
  }, []);

  const shellApi = {
    getData: () => {
      return apiClient.apiCall('getData', {});
    },

    getDialogs: () => {
      return apiClient.apiCall('getDialogs', {});
    },

    saveData: newData => {
      return apiClient.apiCall('saveData', newData);
    },

    navTo: path => {
      return apiClient.apiCall('navTo', { path: path });
    },

    navDown: subPath => {
      return apiClient.apiCall('navDown', { subPath: subPath });
    },

    focusTo: subPath => {
      return apiClient.apiCall('focusTo', { subPath: subPath });
    },
  };

  const RealEditor = data === '' ? '' : getEditor();

  if (RealEditor) {
    window.parent.extensionData = window.parent.extensionData || {};
    window.parent.extensionData[RealEditor.name] = data;
  }

  return (
    <Fragment>
      {RealEditor === '' ? (
        ''
      ) : (
        <RealEditor data={data} dialogs={dialogs} onChange={shellApi.saveData} shellApi={shellApi} />
      )}
    </Fragment>
  );
}

export default ExtensionContainer;
