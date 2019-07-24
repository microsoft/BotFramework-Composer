import React, { useState, useEffect } from 'react';

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
  const [shellData, setShellData] = useState({});

  useEffect(() => {
    apiClient.connect();

    apiClient.registerApi('reset', newShellData => {
      setShellData(newShellData);
    });

    apiClient.registerApi('saveFromChild', args => {
      const callback = subEditorCallbacks[args.from];
      if (callback) {
        callback(args.data);
      }
    });

    shellApi.getState().then(result => {
      setShellData(result);
    });

    return () => {
      apiClient.disconnect();
    };
  }, [shellApi]);

  const shellApi = {
    getState: () => {
      return apiClient.apiCall('getState', {});
    },

    saveData: newData => {
      return apiClient.apiCall('saveData', newData);
    },

    navTo: (path, rest) => {
      return apiClient.apiCall('navTo', { path, rest });
    },

    navDown: subPath => {
      return apiClient.apiCall('navDown', { subPath: subPath });
    },

    focusTo: subPath => {
      return apiClient.apiCall('focusTo', { subPath: subPath });
    },

    shellNavigate: (shellPage, opts = {}) => {
      return apiClient.apiCall('shellNavigate', { shellPage, opts });
    },

    createLuFile: id => {
      return apiClient.apiCall('createLuFile', { id });
    },

    updateLuFile: luFile => {
      return apiClient.apiCall('updateLuFile', luFile);
    },

    getLgTemplates: id => {
      return apiClient.apiCall('getLgTemplates', { id });
    },

    createLgTemplate: (id, template, position) => {
      return apiClient.apiCall('createLgTemplate', { id, template, position });
    },

    removeLgTemplate: (id, templateName) => {
      return apiClient.apiCall('removeLgTemplate', { id, templateName });
    },

    updateLgTemplate: (id, templateName, template) => {
      return apiClient.apiCall('updateLgTemplate', {
        id,
        templateName,
        template: { Name: templateName, Body: template },
      });
    },
  };

  const RealEditor = shellData.data ? getEditor() : null;

  if (RealEditor) {
    window.parent.extensionData = window.parent.extensionData || {};
    window.parent.extensionData[RealEditor.name] = shellData;
  }

  return RealEditor && <RealEditor {...shellData} onChange={shellApi.saveData} shellApi={shellApi} />;
}

export default ExtensionContainer;
