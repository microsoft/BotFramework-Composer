// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BootstrapSampler } from '@microsoft/bf-dispatcher/lib/mathematics/sampler/BootstrapSampler';
import { Utility } from '@microsoft/bf-dispatcher/lib/utility/Utility';

const SAMPLE_SIZE_CONFIGURATION = 2;

export interface IUtterance {
  text: string;
  intent: string;
  entities: any[];
}

export class ComposerBootstrapSampler extends BootstrapSampler<number> {
  private _maxImbalanceRatio: number;
  private _utterances: IUtterance[] = [];

  public constructor(utterances: IUtterance[], maxImbalanceRatio: number) {
    super({}, true, SAMPLE_SIZE_CONFIGURATION);
    this._utterances = utterances;
    this._maxImbalanceRatio = maxImbalanceRatio;
    utterances.forEach((e, index) => {
      const { intent } = e;
      this.addInstance(intent, index);
    });
  }

  public computeMaxBalanceNumber(): number {
    const numberInstancesPerLabelReduce: number = this.labels.reduce(
      (mini: number, key: string) => (this.instances[key].length < mini ? this.instances[key].length : mini),
      Number.MAX_SAFE_INTEGER
    );

    return this._maxImbalanceRatio * numberInstancesPerLabelReduce;
  }

  public computeSamplingNumberInstancesPerLabel(label = ''): number {
    return this.computeMaxBalanceNumber() * SAMPLE_SIZE_CONFIGURATION;
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

  //do re-sample if the ratio is beigher than the maxImbalanceRatio
  public *sampleInstances() {
    for (const key in this.instances) {
      const instanceArray: number[] = this.instances[key];
      const numberInstancesPerLabel: number = instanceArray.length;
      const maxBalanceNumber: number = this.computeMaxBalanceNumber();
      if (numberInstancesPerLabel > maxBalanceNumber) {
        const numberSamplingInstancesPerLabel: number = this.computeSamplingNumberInstancesPerLabel(key);
        for (let i = 0; i < numberSamplingInstancesPerLabel; i++) {
          const indexRandom = Utility.getRandomInt(numberInstancesPerLabel);
          yield instanceArray[indexRandom];
        }
      } else {
        for (let i = 0; i < numberInstancesPerLabel; i++) {
          yield instanceArray[i];
        }
      }
    }
  }
}
