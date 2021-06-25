// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useProjectApi, usePublishApi } from '@bfc/extension-client';

const isUsingAdaptiveRuntimeKey = (runtimeKey?: string): boolean =>
  runtimeKey === 'csharp-azurewebapp-v2' || !!runtimeKey?.startsWith('adaptive-runtime-');

const parseRuntimeKey = (
  runtimeKey?: string
): { isUsingAdaptiveRuntime: boolean; runtimeLanguage?: string; runtimeType?: string } => {
  const isAdaptive = isUsingAdaptiveRuntimeKey(runtimeKey);

  if (runtimeKey && isAdaptive) {
    const parts = runtimeKey?.split('-');
    if (parts.length === 4) {
      return {
        isUsingAdaptiveRuntime: isAdaptive,
        runtimeLanguage: parts[2],
        runtimeType: parts[3],
      };
    }
  }

  return {
    isUsingAdaptiveRuntime: isAdaptive,
    runtimeLanguage: 'dotnet',
    runtimeType: 'webapp',
  };
};

export const usePreferredAppServiceOS = (): string => {
  const { currentProjectId: getCurrentProjectId } = usePublishApi();
  const { projectCollection } = useProjectApi();

  const currentProjectId = getCurrentProjectId();
  const project = projectCollection.find((project) => project.projectId === currentProjectId);
  const runtimeKey = project?.setting.runtime.key;
  if (runtimeKey) {
    const { runtimeLanguage, runtimeType } = parseRuntimeKey(runtimeKey);

    switch (runtimeLanguage) {
      case 'dotnet':
        return 'windows';
      case 'js':
        switch (runtimeType) {
          case 'webapp':
            return 'linux';
          case 'function':
            return 'windows';
          default:
            return 'windows';
        }
        break;
      default:
        return 'windows';
    }
  } else {
    return 'windows';
  }
};
