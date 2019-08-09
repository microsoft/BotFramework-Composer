import React, { useState, useEffect } from 'react';
import { initializeIcons } from 'office-ui-fabric-react';

import ApiClient from '../messenger/ApiClient';
import { ShellData } from '../ShellApi';

import getEditor from './EditorMap';

import './extensionContainer.css';

initializeIcons(undefined, { disableWarnings: true });
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

  onFocusEvent: subPath => {
    return apiClient.apiCall('onFocusEvent', { subPath });
  },

  onFocusSteps: subPaths => {
    return apiClient.apiCall('onFocusSteps', { subPaths });
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

  createDialog: () => {
    return apiClient.apiCall('createDialog');
  },

  validateExpression: (expression: string) => {
    return apiClient.apiCall('isExpression', { expression });
  },
};

function ExtensionContainer() {
  const [shellData, setShellData] = useState<ShellData>({} as ShellData);

  useEffect(() => {
    apiClient.connect();

    apiClient.registerApi('reset', newShellData => {
      console.log('FORM: apiReset');
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
  }, []);

  const RealEditor = shellData.data ? getEditor() : null;

  console.log('FORM: extension container');

  return RealEditor && <RealEditor {...shellData} onChange={shellApi.saveData} shellApi={shellApi} />;
}

export default ExtensionContainer;
