// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DialogSetting, FileInfo, IBotProject, ILuisConfig, Resource } from '@botframework-composer/types';

import { PublishStep, OnDeploymentProgress, PublishingWorkingSet } from './types';

type QnaConfigType = {
  subscriptionKey: string;
  qnaRegion: string | 'westus';
};

type StepConfig = {
  luisConfig: ILuisConfig;
  luResources: Resource[];
  project: IBotProject;
  projectPath: string;
  qnaConfig: QnaConfigType;
  qnaResources: Resource[];
  runtime?: DialogSetting['runtime'];
};

export const createBuildRecognizerStep = (config: StepConfig): PublishStep => {
  const execute = async (workingSet: PublishingWorkingSet, onProgress: OnDeploymentProgress): Promise<void> => {
    const { luResources, qnaResources, luisConfig, qnaConfig, project, projectPath } = config;
    const { builder, files } = project;

    const build = async () => {
      const luFiles: FileInfo[] = [];
      const emptyFiles = {};
      luResources.forEach(({ id, isEmpty }) => {
        const fileName = `${id}.lu`;
        const f = files.get(fileName);
        if (isEmpty) emptyFiles[fileName] = true;
        if (f) {
          luFiles.push(f);
        }
      });
      const qnaFiles: FileInfo[] = [];
      qnaResources.forEach(({ id, isEmpty }) => {
        const fileName = `${id}.qna`;
        const f = files.get(fileName);
        if (isEmpty) emptyFiles[fileName] = true;
        if (f) {
          qnaFiles.push(f);
        }
      });

      //TODO: Consider if the rootDir should vary by runtime
      builder.rootDir = projectPath;
      builder.setBuildConfig(
        { ...luisConfig, ...qnaConfig },
        project.settings.downsampling,
        project.settings.crossTrain
      );
      await builder.build(luFiles, qnaFiles, Array.from(files.values()) as FileInfo[], emptyFiles);
      await builder.copyModelPathToBot();
    };

    onProgress(202, 'Building...');
    await build();
    onProgress(202, 'Build succeeded!');
  };
  return { execute };
};
