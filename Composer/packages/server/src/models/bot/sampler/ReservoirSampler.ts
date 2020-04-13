// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { ReservoirSampler } from '@microsoft/bf-dispatcher/lib/mathematics/sampler/ReservoirSampler';

import { IUtterance } from './BootstrapSampler';

export class ComposerReservoirSampler {
  private _sampler: ReservoirSampler<IUtterance>;
  private _sampleSize = 15000;

  public constructor(utterances: IUtterance[]) {
    this._sampler = new ReservoirSampler<IUtterance>();
    utterances.forEach(e => {
      this._sampler.addInstance(e.intent, e);
    });
  }

  public set sampleSize(v: number) {
    this._sampleSize = v;
  }

  public getSampledUtterances() {
    this._sampler.resetLabelsAndMap();
    return [...this._sampler.sampleInstances(this._sampleSize)];
  }
}
