// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LgTemplate, TelemetryClient } from '@bfc/shared';

import { LGOption } from '../utils';

export type LgLanguageContext =
  | 'expression'
  | 'singleQuote'
  | 'doubleQuote'
  | 'comment'
  | 'templateBody'
  | 'templateName'
  | 'root';

export type PartialStructuredResponse = Partial<Record<StructuredResponseItem['kind'], StructuredResponseItem | null>>;

export type CommonModalityEditorProps = {
  response?: StructuredResponseItem;
  removeModalityDisabled: boolean;
  lgOption?: LGOption;
  lgTemplates?: readonly LgTemplate[];
  memoryVariables?: readonly string[];
  telemetryClient: TelemetryClient;
  onAttachmentLayoutChange?: (layout: string) => void;
  onInputHintChange?: (inputHint: string) => void;
  onTemplateChange: (templateId: string, body?: string) => void;
  onRemoveModality: (modality: ModalityType) => void;
  onRemoveTemplate: (templateId: string) => void;
  onUpdateResponseTemplate: (response: PartialStructuredResponse) => void;
};

/**
 * Structured response types.
 */
export const acceptedInputHintValues = ['expectingInput', 'ignoringInput', 'acceptingInput'] as const;
export const acceptedAttachmentLayout = ['carousel', 'list'] as const;

export const modalityTypes = ['Text', 'Speak', 'Attachments', 'SuggestedActions'] as const;
export const structuredResponseKeys = [...modalityTypes, 'AttachmentLayout', 'InputHint'] as const;

export type ModalityType = typeof modalityTypes[number];

export type TextStructuredResponseItem = { kind: 'Text'; value: string[]; valueType: 'template' | 'direct' };
export type SpeechStructuredResponseItem = { kind: 'Speak'; value: string[]; valueType: 'template' | 'direct' };
export type AttachmentsStructuredResponseItem = {
  kind: 'Attachments';
  value: string[];
  valueType: 'template' | 'direct';
};
export type AttachmentLayoutStructuredResponseItem = {
  kind: 'AttachmentLayout';
  value: typeof acceptedAttachmentLayout[number];
};
export type InputHintStructuredResponseItem = { kind: 'InputHint'; value: typeof acceptedInputHintValues[number] };
export type SuggestedActionsStructuredResponseItem = { kind: 'SuggestedActions'; value: string[] };

export type StructuredResponseItem =
  | TextStructuredResponseItem
  | SpeechStructuredResponseItem
  | SuggestedActionsStructuredResponseItem
  | InputHintStructuredResponseItem
  | AttachmentLayoutStructuredResponseItem
  | AttachmentsStructuredResponseItem;

export type ArrayBasedStructuredResponseItem = TextStructuredResponseItem | SpeechStructuredResponseItem;
