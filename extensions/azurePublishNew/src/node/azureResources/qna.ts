// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ProvisionMethod, ProvisionWorkingSet, ResourceDefinition, ResourceProvisionService } from '../types';

import { SO_STANDARD_TIER, COGNITIVE_SERVICES_GROUP_NAME } from './constants';
import { QnAConfigNew } from './types';

export const qnaDefinition: ResourceDefinition = {
  key: 'qna',
  description:
    'QnA Maker is a cloud-based API service that lets you create a conversational question-and-answer layer over your existing data. Use it to build a knowledge base by extracting questions and answers from your content, including FAQs, manuals, and documents.',
  text: 'Microsoft QnA Maker',
  tier: SO_STANDARD_TIER,
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
    getDependencies: () => ['appRegistration', 'webApp'],
    getRecommendationForProject: (project) => {
      return project.isQnARequired; // tbd
    },
    provision: getQnAProvisionMethod(),
  };
};
