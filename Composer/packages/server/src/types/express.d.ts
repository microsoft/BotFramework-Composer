// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

declare namespace Express {
  export interface Request {
    __nonce__?: string;
  }
}
