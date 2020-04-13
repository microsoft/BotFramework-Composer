// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import keys from 'lodash/keys';
import { Utility } from '@microsoft/bf-dispatcher/lib/utility/Utility';
import { BootstrapSampler } from '@microsoft/bf-dispatcher/lib/mathematics/sampler/BootstrapSampler';

export interface IUtterance {
  text: string;
  intent: string;
  entities: any[];
}

class BaseBootstrapSampler extends BootstrapSampler<string> {
  private _numberInstancesPerLabelReduce = 0;

  public set numberInstancesPerLabelReduce(v: number) {
    this._numberInstancesPerLabelReduce = v;
  }

  public computeSamplingNumberInstancesPerLabel(label = ''): number {
    return this._numberInstancesPerLabelReduce;
  }

  public *sampleIndex() {
    for (const key in this.instances) {
      if (key) {
        const instanceArray: string[] = this.instances[key];
        const numberInstancesPerLabel: number = instanceArray.length;
        if (numberInstancesPerLabel > 0) {
          const numberSamplingInstancesPerLabel: number = this.computeSamplingNumberInstancesPerLabel(key);
          for (let i = 0; i < numberSamplingInstancesPerLabel; i++) {
            const indexRandom = Utility.getRandomInt(numberInstancesPerLabel);
            yield indexRandom;
          }
        }
      }
    }
  }
}

export class ComposerBootstrapSampler {
  private _times = 10;
  private _instances: { [key: string]: IUtterance[] } = {};
  private _minimunLength = Number.MAX_SAFE_INTEGER;

  public constructor(utterances: IUtterance[]) {
    utterances.forEach(e => {
      const { intent } = e;
      if (!this._instances[intent]) this._instances[intent] = [];
      this._instances[intent].push(e);
    });

    this._minimunLength = keys(this._instances).reduce(
      (mini, key) => (this._instances[key].length < mini ? this._instances[key].length : mini),
      Number.MAX_SAFE_INTEGER
    );
  }

  public set times(v: number) {
    this._times = v;
  }

  public getSampledUtterances() {
    const maxNumber = this._minimunLength * this._times;
    keys(this._instances).forEach(key => {
      if (this._instances[key].length > maxNumber) {
        this._replaceUtterances(key, maxNumber);
      }
    });

    return keys(this._instances).reduce((result: IUtterance[], key) => {
      return [
        ...result,
        ...this._instances[key].map(instance => {
          return { ...instance };
        }),
      ];
    }, []);
  }

  private _replaceUtterances(key: string, maxNumber: number) {
    const sampler = new BaseBootstrapSampler();
    sampler.numberInstancesPerLabelReduce = maxNumber;
    this._instances[key].forEach(instance => {
      sampler.addInstance(key, instance.text);
    });
    sampler.resetLabelsAndMap();
    const sampledIndexes = sampler.sampleIndex();
    const set = new Set<number>();
    for (const index of sampledIndexes) {
      set.add(index);
    }
    this._instances[key] = Array.from(set).map(index => this._instances[key][index]);
  }
}
