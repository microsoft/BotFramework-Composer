// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import base64url from 'base64url';
import getPem from 'rsa-pem-from-mod-exp';
import axios from 'axios';
interface OpenIdConfig {
  issuer: string;
  authorization_endpoint: string;
  jwks_uri: string;
  id_token_signing_alg_values_supported: string[];
  token_endpoint_auth_methods_supported: string[];
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
export class OpenIdMetadata {
  private lastUpdated = 0;
  private keys: Key[] = [];

  constructor(public url: string) {}

  public async getKey(keyId: string): Promise<string | null> {
    // If keys are more than 5 days old, refresh them
    const now = new Date().getTime();
    if (this.lastUpdated < now - 1000 * 60 * 60 * 24 * 5) {
      try {
        await this.refreshCache();
      } catch {
        this.keys = [];
      }
    }
    return this.findKey(keyId);
  }

  private async refreshCache() {
    const response = await axios.get(this.url);

    if (response.status >= 400) {
      throw new Error(`Failed to load openID config: ${response.status}`);
    }

    const openIdConfig = response.data as OpenIdConfig;
    const keysResponse = await axios.get(openIdConfig.jwks_uri);

    if (keysResponse.status >= 400) {
      throw new Error(`Failed to load Keys: ${keysResponse.status}`);
    }

    this.lastUpdated = new Date().getTime();
    this.keys = keysResponse.data.keys as Key[];
  }

  private findKey(keyId: string): string | null {
    try {
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
    } catch (ex) {
      return null;
    }
  }
}
