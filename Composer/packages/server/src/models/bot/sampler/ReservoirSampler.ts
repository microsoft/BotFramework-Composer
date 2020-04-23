// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { ReservoirSampler } from '@microsoft/bf-dispatcher/lib/mathematics/sampler/ReservoirSampler';

import { IUtterance } from './BootstrapSampler';

export class ComposerReservoirSampler extends ReservoirSampler<number> {
  private _utterances: IUtterance[] = [];
  private _maxUtteranceAllowed: number;

  public constructor(utterances: IUtterance[], maxUtteranceAllowed: number) {
    super({});
    this._utterances = utterances;
    this._maxUtteranceAllowed = maxUtteranceAllowed;
    utterances.forEach((e, index) => {
      this.addInstance(e.intent, index);
    });
  }

  public getSampledUtterances() {
    if (this._maxUtteranceAllowed && this._utterances.length > this._maxUtteranceAllowed) {
      this.resetLabelsAndMap();

      const sampledIndexes = this.sampleInstances(this._maxUtteranceAllowed);

      const set = new Set([...sampledIndexes]);

      return Array.from(set).map(index => this._utterances[index]);
    } else {
      return this._utterances;
    }
  }
}
