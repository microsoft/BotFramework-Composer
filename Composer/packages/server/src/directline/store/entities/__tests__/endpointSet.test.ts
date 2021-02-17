// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BotEndpoint } from '../botEndpoint';
import { EndpointSet } from '../endpointSet';

let endpoints: EndpointSet;
describe('EndpointSet', () => {
  beforeEach(() => {
    endpoints = new EndpointSet();
  });

  it('should set and get endpoints', () => {
    const endpoint: BotEndpoint = new BotEndpoint(
      'endpoint-1',
      'bot-1',
      'http://localhost:3978/api/messages',
      '123-MSD-324',
      'asdas3234'
    );

    const endpoint2: BotEndpoint = new BotEndpoint(
      'endpoint-2',
      'bot-2',
      'http://localhost:3978/api/messages',
      '123-MSD-324',
      'asdas3234'
    );

    endpoints.set('id-1', endpoint);
    endpoints.set('id-2', endpoint2);
    expect(endpoints.get('id-2')).toEqual(endpoint2);
    expect(endpoints.get('id-1')).toEqual(endpoint);
  });
});
