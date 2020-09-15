// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const getIntellisenseUrl = (): string => {
  let intellisenseWebSocketUrl = window.location.origin.replace(/^https/, 'wss').replace(/^http/, 'ws');
  intellisenseWebSocketUrl = `${intellisenseWebSocketUrl}/intellisense-language-server`;

  return intellisenseWebSocketUrl;
};
