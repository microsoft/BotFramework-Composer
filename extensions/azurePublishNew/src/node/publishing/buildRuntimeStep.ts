// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IBotProject, RuntimeTemplate } from '@botframework-composer/types';

import { OnPublishProgress } from './types';

type StepConfig = {
  luisAppIds: string[];
  profileName: string;
  project: IBotProject;
  projectPath: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  runtimeTemplate: RuntimeTemplate;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  settings: any;
};

type StepResult = {
  pathToArtifacts: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  settings: any;
};

export const buildRuntimeStep = async (config: StepConfig, onProgress: OnPublishProgress): Promise<StepResult> => {
  const { luisAppIds, profileName, project, projectPath, runtimeTemplate, settings } = config;

  onProgress('Building runtime...');

  const qnaConfig = await project.builder.getQnaConfig();

  //TODO: Consider if the entire settings should go in the working set.
  const updatedSettings = {
    ...settings,
    luis: {
      ...settings.luis,
      ...luisAppIds,
    },
    qna: {
      ...settings.qna,
      ...qnaConfig,
    },
  };

  const pathToArtifacts = await runtimeTemplate.buildDeploy(projectPath, project, updatedSettings, profileName);
  return { pathToArtifacts, settings: updatedSettings };
};
