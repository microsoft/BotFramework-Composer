// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';

import { LgResponseEditorProps } from '../types';
import { getStructuredResponseFromTemplate } from '../utils/structuredResponse';

import { ModalityPivot } from './ModalityPivot';

export const LgResponseEditor = React.memo(
  ({
    lgOption,
    lgTemplates,
    memoryVariables,
    telemetryClient,
    editorSettings,
    onTemplateChange,
    onRemoveTemplate = () => {},
  }: LgResponseEditorProps) => {
    const structuredResponse = getStructuredResponseFromTemplate(lgOption?.template);

    return (
      <ModalityPivot
        editorSettings={editorSettings}
        lgOption={lgOption}
        lgTemplates={lgTemplates}
        memoryVariables={memoryVariables}
        structuredResponse={structuredResponse}
        telemetryClient={telemetryClient}
        onRemoveTemplate={onRemoveTemplate}
        onTemplateChange={onTemplateChange}
      />
    );
  }
);
