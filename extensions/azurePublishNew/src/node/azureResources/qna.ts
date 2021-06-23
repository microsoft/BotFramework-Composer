// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { COGNITIVE_SERVICES_GROUP_NAME } from '../getResources';
import { ProvisionMethod, ProvisionWorkingSet, ResourceDefinition, ResourceProvisionService } from '../types';

import { QnAConfigNew } from './types';

export const qnaDefinition: ResourceDefinition = {
  key: 'qna',
  description:
    'QnA Maker is a cloud-based API service that lets you create a conversational question-and-answer layer over your existing data. Use it to build a knowledge base by extracting questions and answers from your content, including FAQs, manuals, and documents.',
  text: 'Microsoft QnA Maker',
  tier: 'S0 Standard',
  group: COGNITIVE_SERVICES_GROUP_NAME,
};

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
    getDependencies: () => ['appRegistration'],
    getRecommendationForProject: (project) => {
      return project.isQnARequired; // tbd
    },
    provision: getQnAProvisionMethod(),
  };
};
