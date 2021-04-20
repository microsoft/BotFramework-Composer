// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type CardTemplate<Body = Record<string, unknown>> = {
  displayName: string;
  body: Body;
  name?: string;
};
