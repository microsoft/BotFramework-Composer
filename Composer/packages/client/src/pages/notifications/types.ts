// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface INotification {
  id: string;
  severity: string;
  type: string;
  location: string;
  message: string;
  diagnostic: any;
}

export const DiagnosticSeverity = ['Error', 'Warning']; //'Information', 'Hint'
