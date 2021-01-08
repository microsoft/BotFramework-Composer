// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import Worker from './workers/validator.worker.ts';
import { BaseWorker } from './baseWorker';
import { ValidateActionType, ValidatorPayload } from './types';

// Wrapper class
class ValidateWorker extends BaseWorker<ValidateActionType> {
  validateDialog(data: ValidatorPayload) {
    return this.sendMsg<ValidatorPayload>(ValidateActionType.DialogValidator, data);
  }
}

export default new ValidateWorker(new Worker());
