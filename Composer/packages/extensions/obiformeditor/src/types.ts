// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export enum MemoryScope {
  user = 'user',
  conversation = 'conversation',
  dialog = 'dialog',
  turn = 'turn',
}
interface MemoryBag {
  [key: string]: any;
}

export interface FormMemory {
  [MemoryScope.user]: MemoryBag;
  [MemoryScope.conversation]: MemoryBag;
  [MemoryScope.dialog]: MemoryBag;
  [MemoryScope.turn]: MemoryBag;
}

export interface FormData {
  $type: string;
  [key: string]: any;
}
