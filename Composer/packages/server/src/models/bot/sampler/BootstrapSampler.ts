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
  private _maxImbalanceRatio = 10;
  private _utterances: IUtterance[] = [];

  public constructor(utterances: IUtterance[], maxImbalanceRatio) {
    super({}, true, SAMPLE_SIZE_CONFIGURATION);
    this._utterances = utterances;
    this._maxImbalanceRatio = maxImbalanceRatio;
    utterances.forEach((e, index) => {
      const { intent } = e;
      this.addInstance(intent, index);
    });
  }

  public computeSamplingNumberInstancesPerLabel(label = ''): number {
    const numberInstancesPerLabelReduce: number = this.labels.reduce(
      (mini: number, key: string) => (this.instances[key].length < mini ? this.instances[key].length : mini),
      Number.MAX_SAFE_INTEGER
    );

    return this._maxImbalanceRatio * numberInstancesPerLabelReduce * SAMPLE_SIZE_CONFIGURATION;
  }

  public getSampledUtterances() {
    if (this._maxImbalanceRatio) {
      this.resetLabelsAndMap();

      const sampledIndexes = this.sampleInstances();

      const set = new Set([...sampledIndexes]);

      return Array.from(set).map(index => this._utterances[index]);
    } else {
      return this._utterances;
    }
  }
}
