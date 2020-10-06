// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import trimStart from 'lodash/trimStart';

export const convertFileProtocolToPath = (pathToBot: string): string => {
  const fileProtocolRemoved = pathToBot.replace('file://', '');
  if (fileProtocolRemoved.match(/^\/[a-zA-Z]:\//g)) {
    //Windows path with file protocol. Remove leading /
    return trimStart(fileProtocolRemoved, '/');
  }
  return fileProtocolRemoved;
};

export const convertAbsolutePathToFileProtocol = (pathToBot: string): string => {
  let pathName = pathToBot.replace(/\\/g, '/');
  // Windows drive letter must be prefixed with a slash
  if (pathName[0] !== '/') {
    pathName = '/' + pathName;
  }
  return encodeURI('file://' + pathName);
};
