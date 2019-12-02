// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { BaseSchema } from '@bfc/shared';

export const INSERT_NODE = 'VISUAL/INSERT_NODE';
export function insertNode(targetArrayId: string, targetArrayIndex: number, newNode: BaseSchema) {
  return {
    type: INSERT_NODE,
    payload: {
      targetArrayId,
      targetArrayIndex,
      node: newNode,
    },
  };
}

export const CREATE_NODE = 'VISUAL/CREATE_NODE';
export function createNode(targetArrayId: string, targetArrayIndex: string, $type: string) {
  return {
    type: CREATE_NODE,
    payload: {
      targetArrayId,
      targetArrayIndex,
      $type,
    },
  };
}

export const CREATE_EVENT = 'VISUAL/CREATE_EVENT';
export function createEvent(targetIndex: string, $type: string) {
  return {
    type: CREATE_EVENT,
    payload: {
      targetIndex,
      $type,
    },
  };
}

export const APPEND_NODES = 'VISUAL/APPEND_NODES';
export function appendNodes(targetNodeId: string, actions: BaseSchema[]) {
  return {
    type: APPEND_NODES,
    payload: {
      targetNodeId,
      actions,
    },
  };
}

export const DELETE_NODE = 'VISUAL/DELETE_NODE';
export function deleteNode(nodeId: string) {
  return {
    type: DELETE_NODE,
    payload: nodeId,
  };
}

export const DELETE_NODES = 'VISUAL/DELETE_NODES';
export function deleteNodes(nodeIds: string[]) {
  return {
    type: DELETE_NODES,
    payload: nodeIds,
  };
}

export const COPY_NODES = 'VISUAL/COPY_NODES';
export function copyNodes(nodeIds: string[]) {
  return {
    type: COPY_NODES,
    payload: nodeIds,
  };
}

export const CUT_NODES = 'VISUAL/CUT_NODES';
export function cutNodes(nodeIds: string[]) {
  return {
    type: CUT_NODES,
    payload: nodeIds,
  };
}

export const PASTE_NODES = 'VISUAL/PASTE_NODES';
export function pasteNodes(targetArrayId: string, targetArrayIndex: number) {
  return {
    type: PASTE_NODES,
    payload: {
      targetArrayId,
      targetArrayIndex,
    },
  };
}
