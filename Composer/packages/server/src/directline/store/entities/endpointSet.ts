// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import base64url from 'base64url';

import { generateUniqueId } from '../../utils/helpers';

import { BotEndpoint } from './botEndpoint';

export class EndpointSet {
  private endpoints: Record<string, BotEndpoint> = {};

  public set(id: string, botEndpoint: BotEndpoint): BotEndpoint {
    id = id || botEndpoint.botUrl || generateUniqueId();
    this.endpoints[id] = botEndpoint;
    return botEndpoint;
  }

  public get(id: string): BotEndpoint | undefined {
    try {
      const savedEndpoint = this.endpoints[id];
      if (savedEndpoint) {
        return savedEndpoint;
      }
      const decoded = JSON.parse(base64url.decode(id));
      return this.get(decoded.endpointId);
    } catch (ex) {
      return;
    }
  }

  public clear(): void {
    this.endpoints = {};
  }
}
