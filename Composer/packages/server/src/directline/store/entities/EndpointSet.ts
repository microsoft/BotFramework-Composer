// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import base64url from 'base64url';

import { generateUniqueId } from '../../utils/helpers';
import { BotEndpoint } from '../../utils/botEndpoint';

export class EndpointSet {
  private _endpoints: Record<string, BotEndpoint> = {};

  public set(id: string, botEndpoint: BotEndpoint): BotEndpoint {
    id = id || botEndpoint.botUrl || generateUniqueId();

    const botEndpointInstance = new BotEndpoint(
      id,
      botEndpoint.botId,
      botEndpoint.botUrl,
      botEndpoint.msaAppId,
      botEndpoint.msaPassword
    );

    this._endpoints[id] = botEndpointInstance;

    return botEndpointInstance;
  }

  public get(id: string): BotEndpoint | undefined {
    try {
      const savedEndpoint = this._endpoints[id];
      if (savedEndpoint) {
        return savedEndpoint;
      }
      const decoded = JSON.parse(base64url.decode(id));
      return this.get(decoded.endpointId);
    } catch (ex) {
      return undefined;
    }
  }

  public clear() {
    this._endpoints = {};
  }
}
