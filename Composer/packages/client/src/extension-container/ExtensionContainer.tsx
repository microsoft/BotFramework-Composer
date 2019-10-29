/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
import React, { useState, useEffect } from 'react';
import { initializeIcons } from 'office-ui-fabric-react';
import { LuFile, ShellData } from 'shared';

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

const shellApi = {
  getState: (): Promise<ShellData> => {
    return apiClient.apiCall('getState', {});
  },

  saveData: (newData, updatePath) => {
    return apiClient.apiCall('saveData', { newData, updatePath });
  },

  navTo: (path: string, rest) => {
    return apiClient.apiCall('navTo', { path, rest });
  },

  navDown: (subPath: string) => {
    return apiClient.apiCall('navDown', { subPath: subPath });
  },

  focusTo: (subPath: string) => {
    return apiClient.apiCall('focusTo', { subPath: subPath });
  },

  onFocusEvent: (subPath: string) => {
    return apiClient.apiCall('onFocusEvent', { subPath });
  },

  onFocusSteps: (subPaths: string[], fragment?: string) => {
    return apiClient.apiCall('onFocusSteps', { subPaths, fragment });
  },

  onSelect: (ids: string[]) => {
    return apiClient.apiCall('onSelect', { ids });
  },

  shellNavigate: (shellPage, opts = {}) => {
    return apiClient.apiCall('shellNavigate', { shellPage, opts });
  },

  createLuFile: (id: string) => {
    return apiClient.apiCall('createLuFile', { id });
  },

  updateLuFile: (luFile: LuFile) => {
    return apiClient.apiCall('updateLuFile', luFile);
  },

  updateLgFile: (id: string, content: string) => {
    return apiClient.apiCall('updateLgFile', { id, content });
  },

  getLgTemplates: (id: string) => {
    return apiClient.apiCall('getLgTemplates', { id });
  },

  createLgTemplate: (id: string, template: string, position?: number) => {
    return apiClient.apiCall('createLgTemplate', { id, template, position });
  },

  removeLgTemplate: (id: string, templateName: string) => {
    return apiClient.apiCall('removeLgTemplate', { id, templateName });
  },

  updateLgTemplate: (id: string, templateName: string, template: string) => {
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

  undo: () => {
    return apiClient.apiCall('undo');
  },

  redo: () => {
    return apiClient.apiCall('redo');
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
