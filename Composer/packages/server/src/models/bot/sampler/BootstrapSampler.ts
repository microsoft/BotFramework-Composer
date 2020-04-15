// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BootstrapSampler } from '@microsoft/bf-dispatcher/lib/mathematics/sampler/BootstrapSampler';

const SAMPLE_SIZE_CONFIGURATION = 2;

export interface IUtterance {
  text: string;
  intent: string;
  entities: any[];
}

export class ComposerBootstrapSampler extends BootstrapSampler<number> {
  private _times = 10;
  private _utterances: IUtterance[] = [];

  public constructor(utterances: IUtterance[]) {
    super({}, true, SAMPLE_SIZE_CONFIGURATION);
    this._utterances = utterances;
    utterances.forEach((e, index) => {
      const { intent } = e;
      this.addInstance(intent, index);
    });
  }

  public set times(v: number) {
    this._times = v;
  }

  public computeSamplingNumberInstancesPerLabel(label = ''): number {
    const numberInstancesPerLabelReduce: number = this.labels.reduce(
      (mini: number, key: string) => (this.instances[key].length < mini ? this.instances[key].length : mini),
      Number.MAX_SAFE_INTEGER
    );

    return this._times * numberInstancesPerLabelReduce * SAMPLE_SIZE_CONFIGURATION;
  }

  public getSampledUtterances() {
    this.resetLabelsAndMap();

    const sampledIndexes = this.sampleInstances();

    const set = new Set([...sampledIndexes]);

    return Array.from(set).map(index => this._utterances[index]);
  }
}
