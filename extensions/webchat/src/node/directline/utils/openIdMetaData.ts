/* eslint-disable @typescript-eslint/no-var-requires */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const base64url = require('base64url');
const getPem = require('rsa-pem-from-mod-exp');

export class OpenIdMetadata {
  private keys: Key[];

  constructor(public url: string) {
    this.keys = [];
  }

  public async getKey(keyId: string) {
    if (!this.keys) {
      return null;
    }

    for (let i = 0; i < this.keys.length; i++) {
      if (this.keys[i].kid === keyId) {
        const key = this.keys[i];

        if (!key.n || !key.e) {
          // Return null for non-RSA keys
          return null;
        }

        return getPem(base64url.toBase64(key.n), key.e);
      }
    }

    return null;
  }
}

interface Key {
  kty: string;
  use: string;
  kid: string;
  x5t: string;
  n: string;
  e: string;
  x5c: string[];
}
