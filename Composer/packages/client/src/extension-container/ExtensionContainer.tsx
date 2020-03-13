// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useEffect } from 'react';
import { initializeIcons } from '@uifabric/icons';
import { ShellData, ShellApi } from '@bfc/shared';

import ApiClient from '../messenger/ApiClient';

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

const shellApi: ShellApi = {
  getState: () => {
    return apiClient.apiCall('getState', {});
  },

  saveData: (newData, updatePath) => {
    return apiClient.apiCall('saveData', { newData, updatePath });
  },

  navTo: (path, rest) => {
    return apiClient.apiCall('navTo', { path, rest });
  },

  onFocusEvent: subPath => {
    return apiClient.apiCall('onFocusEvent', { subPath });
  },

  onFocusSteps: (subPaths, fragment) => {
    return apiClient.apiCall('onFocusSteps', { subPaths, fragment });
  },

  onSelect: ids => {
    return apiClient.apiCall('onSelect', ids);
  },

  onCopy: actions => {
    return apiClient.apiCall('onCopy', actions);
  },

  createLuFile: id => {
    return apiClient.apiCall('createLuFile', { id });
  },

  updateLuFile: luFile => {
    return apiClient.apiCall('updateLuFile', luFile);
  },

  updateLgFile: (id, content) => {
    return apiClient.apiCall('updateLgFile', { id, content });
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

  removeLgTemplates: (id, templateNames) => {
    return apiClient.apiCall('removeLgTemplates', { id, templateNames });
  },

  copyLgTemplate: (id, fromTemplateName, toTemplateName) => {
    return apiClient.apiCall('copyLgTemplate', { id, fromTemplateName, toTemplateName });
  },

  updateLgTemplate: (id, templateName, template) => {
    return apiClient.apiCall('updateLgTemplate', {
      id,
      templateName,
      template: { name: templateName, body: template },
    });
  },

  addLuIntent: (id, intent) => {
    return apiClient.apiCall('addLuIntent', { id, intent });
  },

  updateLuIntent: (id, intentName, intent) => {
    return apiClient.apiCall('updateLuIntent', { id, intentName, intent });
  },

  removeLuIntent: (id, intentName) => {
    return apiClient.apiCall('removeLuIntent', { id, intentName });
  },

  createDialog: actions => {
    return apiClient.apiCall('createDialog', { actions });
  },

  updateRegExIntent: (id, intentName, pattern) => {
    return apiClient.apiCall('updateRegExIntent', { id, intentName, pattern });
  },

  validateExpression: expression => {
    return apiClient.apiCall('isExpression', { expression });
  },

  undo: () => {
    return apiClient.apiCall('undo');
  },

  redo: () => {
    return apiClient.apiCall('redo');
  },

  addCoachMarkRef: target => {
    return apiClient.apiCall('addCoachMarkPosition', target);
  },
};

function ExtensionContainer() {
  const [shellData, setShellData] = useState<ShellData>({} as ShellData);

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

    apiClient.registerApi('rpc', (method, ...params) => {
      const handler = (window as any)[method];
      let result;
      if (handler) {
        result = handler(...params);
      }

      return result;
    });

    shellApi.getState().then(result => {
      setShellData(result);
    });

    return () => {
      apiClient.disconnect();
    };
  }, []);

  const RealEditor = shellData.data ? getEditor() : null;

  return RealEditor && <RealEditor {...shellData} onChange={shellApi.saveData} shellApi={shellApi} />;
}

export default ExtensionContainer;
