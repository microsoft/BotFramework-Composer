// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface INotification {
  severity: string;
  type: string;
  location: string;
  message: string;
  diagnostic: any;
}
