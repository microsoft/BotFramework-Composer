// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { ReservoirSampler } from '@microsoft/bf-dispatcher/lib/mathematics/sampler/ReservoirSampler';

import { IUtterance } from './BootstrapSampler';

const MIN_SAMPLE_SIZE = 15000;

export class ComposerReservoirSampler extends ReservoirSampler<number> {
  private _utterances: IUtterance[] = [];
  private _sampleSize = MIN_SAMPLE_SIZE;

  public constructor(utterances: IUtterance[]) {
    super({});
    this._utterances = utterances;
    utterances.forEach((e, index) => {
      this.addInstance(e.intent, index);
    });
  }

  public set sampleSize(v: number) {
    this._sampleSize = v;
  }

  public getSampledUtterances() {
    this.resetLabelsAndMap();
    if (this._utterances.length > this._sampleSize) {
      const sampledIndexes = this.sampleInstances(this._sampleSize);

      const set = new Set([...sampledIndexes]);

      return Array.from(set).map(index => this._utterances[index]);
    } else {
      return this._utterances;
    }
  }
}
