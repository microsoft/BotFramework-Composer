// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IPublisher {
  id: string;
  name: string;
  endpoint: string;
  baseUrl: string;
  online?: boolean;
  history?: IHistory[];
}

export interface IHistory {
  botID: string;
  version: string;
  lastUpdateTime: string;
}
