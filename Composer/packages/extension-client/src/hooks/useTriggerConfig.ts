// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useContext, useMemo } from 'react';
import get from 'lodash/get';
import { SDKKinds } from '@botframework-composer/types';

import { EditorExtensionContext } from '../EditorExtensionContext';
import { TriggerUISchema } from '../types';

export function useTriggerConfig() {
  const { plugins, shellData } = useContext(EditorExtensionContext);
  const { schemas } = shellData;

  const isPvaEnv = Boolean(get(schemas, 'sdk.content.definitions["Microsoft.VirtualAgents.Recognizer"]'));

  const triggerConfig: TriggerUISchema = useMemo(() => {
    const implementedTriggerSchema: TriggerUISchema = {};
    Object.entries(plugins.uiSchema ?? {}).forEach(([$kind, options]) => {
      if (options?.trigger) {
        implementedTriggerSchema[$kind] = options.trigger;
      }
    });

    // Hide 'OnChooseIntent' and 'OnQnAMatch' from PVA bots.
    if (isPvaEnv) {
      delete implementedTriggerSchema[SDKKinds.OnChooseIntent];
      delete implementedTriggerSchema[SDKKinds.OnQnAMatch];
    }
    return implementedTriggerSchema;
  }, [plugins.uiSchema]);

  return triggerConfig;
}
