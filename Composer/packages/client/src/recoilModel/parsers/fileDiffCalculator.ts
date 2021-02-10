// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FileAsset } from '../persistence/types';

import Worker from './workers/calculator.worker.ts';
import { BaseWorker } from './baseWorker';
import { FilesDifferencePayload, CalculatorType } from './types';

// Wrapper class
class FileDiffCalculator extends BaseWorker<CalculatorType> {
  difference(target: FileAsset[], origin: FileAsset[]) {
    const payload = { target, origin };
    return this.sendMsg<FilesDifferencePayload>('difference', payload);
  }
}

export default new FileDiffCalculator(new Worker());
