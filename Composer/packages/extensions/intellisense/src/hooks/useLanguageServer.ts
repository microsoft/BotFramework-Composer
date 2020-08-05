// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { CompletionItem } from 'vscode-languageserver-types';
import { w3cwebsocket as W3CWebSocket } from 'websocket';

import {
  getCompletionRequestMessage,
  getConfigurationChangedMessage,
  getDocumentChangedMessage,
  getInitializeMessage,
  getTextDocumentOpenedMessage,
} from '../utils/lspMessagesUtils';

const LANGUAGE_NAME = 'intellisense';

/**
 * A hook that connects to a LSP server. It takes information about a textField (value, position) and returns completion results
 * @param url url of the LSP server
 * @param scopes scopes are used to filter the type of completion results to show (variables, expressions, etc..)
 * @param documentUri a unique identifier for the textField
 * @param textFieldValue current value of textField
 * @param cursorPosition position of textField cursor
 */
export const useLanguageServer = (
  url: string,
  scopes: string[],
  documentUri: string,
  textFieldValue: string,
  cursorPosition: number,
  projectId?: string
): CompletionItem[] => {
  const ws = React.useRef<W3CWebSocket>();

  const latestMessageId = React.useRef(0);
  const latestDocumentVersion = React.useRef(0);

  const [completionItems, setCompletionItems] = React.useState<CompletionItem[]>([]);

  // Initialize websocket connection for a specific url
  React.useEffect(() => {
    ws.current = new W3CWebSocket(url);
    ws.current.onopen = () => {
      ws.current.send(JSON.stringify(getInitializeMessage(scopes, projectId)));
      ws.current.send(
        JSON.stringify(
          getTextDocumentOpenedMessage(documentUri, LANGUAGE_NAME, latestDocumentVersion.current, textFieldValue)
        )
      );
    };
    ws.current.onmessage = (messageText) => {
      handleMessage(messageText);
    };
  }, [url]);

  // If scopes change, update backend with info
  React.useEffect(() => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(getConfigurationChangedMessage(scopes, projectId)));
    }
  }, [scopes, projectId]);

  // When textField value changes, update backend memory and get latest completion results
  React.useEffect(() => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      updateBackendMemory(textFieldValue);
    }
  }, [textFieldValue]);

  // Get completion results when selection changes
  React.useEffect(() => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      getCompletionItems();
    }
  }, [cursorPosition]);

  // Handles messages coming back from the LSP server
  const handleMessage = (messageText: MessageEvent) => {
    const message = JSON.parse(messageText.data);
    const id = message.id;

    // Only completion messages have an id
    // In the future, if other types of messages use id, then we would have to keep a table of {id: typeOfMessage} to know how to handle each message based on their id
    if (id) {
      if (message.result?.items) {
        setCompletionItems(message.result?.items);
      } else {
        setCompletionItems([]);
      }
    }
  };

  // Every time the textField value changes, we need to tell the backend about it
  const updateBackendMemory = (newValue: string) => {
    latestDocumentVersion.current += 1;

    if (ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(getDocumentChangedMessage(newValue, documentUri, latestDocumentVersion.current)));
    }
  };

  // Requests completion results
  const getCompletionItems = () => {
    latestMessageId.current += 1;

    ws.current.send(
      JSON.stringify(
        getCompletionRequestMessage(latestMessageId.current, documentUri, {
          line: 0,
          character: cursorPosition,
        })
      )
    );
  };

  return completionItems;
};
