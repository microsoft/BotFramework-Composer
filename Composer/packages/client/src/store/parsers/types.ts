// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { LuIntentSection, LgFile, FileInfo } from '@bfc/shared';

export type LuPayload = {
  type: LuActionType;
  content: string;
  id?: string;
  intentName?: string;
  intent?: LuIntentSection;
};

export type LgPayload = {
  targetId: string;
  content: string;
  lgFiles: LgFile[];
};

export type IndexPayload = {
  files: FileInfo;
  botName: string;
  schemas: any;
  locale: string;
};

export enum LuActionType {
  Parse = 'parse',
  AddIntent = 'add-intent',
  UpdateIntent = 'update-intent',
  RemoveIntent = 'remove-intent',
}
