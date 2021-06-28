// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ProvisionMethod, ProvisionWorkingSet, ResourceProvisionService } from '../types';

import { QnAConfigNew } from './types';

const getQnAProvisionMethod = (): ProvisionMethod => {
  return (config: QnAConfigNew, workingSet: ProvisionWorkingSet): Promise<ProvisionWorkingSet> => {
    const provisionResult = {};

    return {
      ...workingSet,
      qna: provisionResult,
    };
  };
};

export const getQnAProvisionService = (): ResourceProvisionService => {
  return {
    getDependencies: () => ['webApp'],
    getRecommendationForProject: (project) => {
      return project.isQnARequired; // tbd
    },
    provision: getQnAProvisionMethod(),
    canPollStatus: false,
  };
};
