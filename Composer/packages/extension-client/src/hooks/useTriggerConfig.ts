// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useContext, useMemo } from 'react';

import { EditorExtensionContext } from '../EditorExtensionContext';
import { TriggerUISchema } from '../types';

export function useTriggerConfig() {
  const { plugins } = useContext(EditorExtensionContext);

  const triggerConfig: TriggerUISchema = useMemo(() => {
    const implementedTriggerSchema: TriggerUISchema = {};
    Object.entries(plugins.uiSchema ?? {}).forEach(([$kind, options]) => {
      if (options?.trigger) {
        implementedTriggerSchema[$kind] = options.trigger;
      }
    });
    return implementedTriggerSchema;
  }, [plugins.uiSchema]);

  return triggerConfig;
}
