// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import formatMessage from 'format-message';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { PlaceHolderSectionName } from '@bfc/indexers/lib/utils/luUtil';
import { UserSettings, DialogInfo, SDKKinds, LuFile } from '@bfc/shared';
import { LuEditor, inlineModePlaceholder } from '@bfc/code-editor';

import { TriggerFormData, TriggerFormDataErrors } from '../../utils/dialogUtil';
import { isRegExRecognizerType, isLUISnQnARecognizerType, isPVARecognizerType } from '../../utils/dialogValidator';
import TelemetryClient from '../../telemetry/TelemetryClient';

import { intentStyles } from './styles';
import { validateEventName, validateIntentName, getLuDiagnostics, validateRegExPattern } from './validators';

export function resolveTriggerWidget(
  selectedType: string,
  dialogFile: DialogInfo | undefined,
  formData: TriggerFormData,
  setFormData: (data: TriggerFormData) => void,
  userSettings: UserSettings,
  projectId: string,
  dialogId: string,
  luFile?: LuFile
) {
  const isRegEx = isRegExRecognizerType(dialogFile);
  const isLUISnQnA = isLUISnQnARecognizerType(dialogFile) || isPVARecognizerType(dialogFile);
  const showTriggerPhrase = selectedType === SDKKinds.OnIntent && !isRegEx;

  const onNameChange = (e: React.FormEvent, name: string | undefined) => {
    const errors: TriggerFormDataErrors = {};
    if (name == null) return;
    errors.intent = validateIntentName(selectedType, name);
    if (showTriggerPhrase && formData.triggerPhrases) {
      errors.triggerPhrases = getLuDiagnostics(name, formData.triggerPhrases);
    }
    setFormData({ ...formData, intent: name, errors: { ...formData.errors, ...errors } });
  };

  const onChangeRegEx = (e: React.FormEvent, pattern: string | undefined) => {
    const errors: TriggerFormDataErrors = {};
    if (pattern == null) return;
    errors.regEx = validateRegExPattern(selectedType, isRegEx, pattern);
    setFormData({ ...formData, regEx: pattern, errors: { ...formData.errors, ...errors } });
  };

  //Trigger phrase is optional
  const onTriggerPhrasesChange = (body: string) => {
    const errors: TriggerFormDataErrors = {};
    if (body) {
      errors.triggerPhrases = getLuDiagnostics(formData.intent, body);
    } else {
      errors.triggerPhrases = '';
    }
    setFormData({ ...formData, triggerPhrases: body, errors: { ...formData.errors, ...errors } });
  };

  const handleEventNameChange = (event: React.FormEvent, value?: string) => {
    const errors: TriggerFormDataErrors = {};
    errors.event = validateEventName(selectedType, SDKKinds.OnDialogEvent, value || '');
    setFormData({
      ...formData,
      $kind: SDKKinds.OnDialogEvent,
      event: value || '',
      errors: { ...formData.errors, ...errors },
    });
  };

  const onIntentWidgetRegex = (
    <React.Fragment>
      <TextField
        data-testid="TriggerName"
        errorMessage={formData.errors.intent}
        label={formatMessage('What is the name of this trigger (RegEx)')}
        styles={intentStyles}
        onChange={onNameChange}
      />
      <TextField
        data-testid="RegExField"
        errorMessage={formData.errors.regEx}
        label={formatMessage('Please input regEx pattern')}
        onChange={onChangeRegEx}
      />
    </React.Fragment>
  );

  const onIntentWidgetLUISQnA = (
    <React.Fragment>
      <TextField
        data-testid="TriggerName"
        errorMessage={formData.errors.intent}
        label={formatMessage('What is the name of this trigger (LUIS)')}
        styles={intentStyles}
        onChange={onNameChange}
      />
      <Label>{formatMessage('Trigger phrases')}</Label>
      <LuEditor
        editorSettings={userSettings.codeEditor}
        errorMessage={formData.errors.triggerPhrases}
        height={225}
        luFile={luFile}
        luOption={{
          projectId,
          fileId: dialogId,
          sectionId: PlaceHolderSectionName,
          luFeatures: {},
        }}
        placeholder={inlineModePlaceholder}
        telemetryClient={TelemetryClient}
        value={formData.triggerPhrases}
        onChange={onTriggerPhrasesChange}
      />
    </React.Fragment>
  );

  const onIntentWidgetCustom = (
    <TextField
      data-testid="TriggerName"
      errorMessage={formData.errors.intent}
      label={formatMessage('What is the name of this trigger')}
      styles={intentStyles}
      onChange={onNameChange}
    />
  );

  const onIntentWidget = isRegEx ? onIntentWidgetRegex : isLUISnQnA ? onIntentWidgetLUISQnA : onIntentWidgetCustom;

  const onEventWidget = (
    <TextField
      required
      data-testid="CustomEventName"
      errorMessage={formData.errors.event}
      label={formatMessage('What is the name of the custom event?')}
      styles={intentStyles}
      onChange={handleEventNameChange}
    />
  );

  let widget;
  switch (selectedType) {
    case SDKKinds.OnIntent:
      widget = onIntentWidget;
      break;
    case SDKKinds.OnDialogEvent:
      widget = onEventWidget;
      break;
    default:
      break;
  }
  return widget;
}
