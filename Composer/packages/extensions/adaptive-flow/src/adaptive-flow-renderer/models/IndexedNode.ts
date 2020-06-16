// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import clone from 'lodash/clone';

export class IndexedNode {
  id: string;
  json: any;
  constructor(id, payload) {
    this.id = id;
    // Adaptive Flow lib leverages origin json to store necessary UI states,
    // thus shallow clone input json here to support immutable case.
    this.json = clone(payload);
  }
}
