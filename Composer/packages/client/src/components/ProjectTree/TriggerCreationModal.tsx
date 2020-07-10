// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useState, useEffect } from 'react';
import formatMessage from 'format-message';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { luIndexer, combineMessage } from '@bfc/indexers';
import { PlaceHolderSectionName } from '@bfc/indexers/lib/utils/luUtil';
import { DialogInfo, SDKKinds } from '@bfc/shared';
import { LuEditor, inlineModePlaceholder, defaultQnAPlaceholder } from '@bfc/code-editor';
import { IComboBoxOption } from 'office-ui-fabric-react/lib/ComboBox';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import get from 'lodash/get';
import { FontWeights } from '@uifabric/styling';
import { FontSizes, SharedColors } from '@uifabric/fluent-theme';

import { useStoreContext } from '../../hooks/useStoreContext';
import { addIntent } from '../../utils/luUtil';
import {
  generateNewDialog,
  getTriggerTypes,
  TriggerFormData,
  TriggerFormDataErrors,
  eventTypeKey,
  customEventKey,
  intentTypeKey,
  activityTypeKey,
  getEventTypes,
  getActivityTypes,
  regexRecognizerKey,
  qnaMatcherKey,
  onChooseIntentKey,
  adaptiveCardKey,
} from '../../utils/dialogUtil';
import { nameRegex } from '../../constants';

// -------------------- Styles -------------------- //

const styles = {
  dialog: {
    title: {
      fontWeight: FontWeights.bold,
      fontSize: FontSizes.size20,
      paddingTop: '14px',
      paddingBottom: '11px',
    },
    subText: {
      fontSize: FontSizes.size14,
    },
  },
  modal: {
    main: {
      maxWidth: '600px !important',
    },
  },
};

const dropdownStyles = {
  label: {
    fontWeight: FontWeights.semibold,
  },
  dropdown: {
    width: '400px',
  },
  root: {
    marginBottom: '20px',
  },
};

const dialogWindow = css`
  display: flex;
  flex-direction: column;
  width: 400px;
  min-height: 300px;
`;

const intent = {
  root: {
    width: '400px',
    paddingBottom: '20px',
  },
};

export const optionRow = {
  display: 'flex',
  height: 15,
  fontSize: 15,
};

export const warningIcon = {
  marginLeft: 5,
  color: SharedColors.red10,
  fontSize: 5,
};

export const warningText = {
  color: SharedColors.red10,
  fontSize: 5,
};

// -------------------- Validation Helpers -------------------- //

const initialFormDataErrors = {
  $kind: '',
  intent: '',
  event: '',
  triggerPhrases: '',
  regEx: '',
  activity: '',
};

const getLuDiagnostics = (intent: string, triggerPhrases: string) => {
  const content = `#${intent}\n${triggerPhrases}`;
  const { diagnostics } = luIndexer.parse(content);
  return combineMessage(diagnostics);
};

const getQnADiagnostics = (content: string) => {
  const { diagnostics } = luIndexer.parse(content);
  return combineMessage(diagnostics);
};

const validateIntentName = (selectedType: string, intent: string): string | undefined => {
  if (selectedType === intentTypeKey && (!intent || !nameRegex.test(intent))) {
    return formatMessage('Spaces and special characters are not allowed. Use letters, numbers, -, or _.');
  }
  return undefined;
};

const validateDupRegExIntent = (
  selectedType: string,
  intent: string,
  isRegEx: boolean,
  regExIntents: [{ intent: string; pattern: string }]
): string | undefined => {
  if (selectedType === intentTypeKey && isRegEx && regExIntents.find((ri) => ri.intent === intent)) {
    return `regEx ${intent} is already defined`;
  }
  return undefined;
};

const validateRegExPattern = (selectedType: string, isRegEx: boolean, regEx: string): string | undefined => {
  if (selectedType === intentTypeKey && isRegEx && !regEx) {
    return formatMessage('Please input regEx pattern');
  }
  return undefined;
};

const validateEventName = (selectedType: string, $kind: string, eventName: string): string | undefined => {
  if (selectedType === customEventKey && $kind === eventTypeKey && !eventName) {
    return formatMessage('Please enter an event name');
  }
  return undefined;
};

const validateEventKind = (selectedType: string, $kind: string): string | undefined => {
  if (selectedType === eventTypeKey && !$kind) {
    return formatMessage('Please select a event type');
  }

  if (selectedType === activityTypeKey && !$kind) {
    return formatMessage('Please select an activity type');
  }
  return undefined;
};

const validateTriggerKind = (selectedType: string): string | undefined => {
  if (!selectedType) {
    return formatMessage('Please select a trigger type');
  }
  return undefined;
};

const validateTriggerPhrases = (
  selectedType: string,
  isRegEx: boolean,
  intent: string,
  triggerPhrases: string
): string | undefined => {
  if (selectedType === intentTypeKey && !isRegEx) {
    if (triggerPhrases) {
      return getLuDiagnostics(intent, triggerPhrases);
    } else {
      return formatMessage('Please input trigger phrases');
    }
  }
  return undefined;
};

const validateForm = (
  selectedType: string,
  data: TriggerFormData,
  isRegEx: boolean,
  regExIntents: [{ intent: string; pattern: string }]
): TriggerFormDataErrors => {
  const errors: TriggerFormDataErrors = {};
  const { $kind, event: eventName, intent, regEx, triggerPhrases } = data;

  errors.event = validateEventName(selectedType, $kind, eventName) ?? validateEventKind(selectedType, $kind);
  errors.$kind = validateTriggerKind(selectedType);
  errors.intent = validateIntentName(selectedType, intent);
  errors.regEx =
    validateDupRegExIntent(selectedType, intent, isRegEx, regExIntents) ??
    validateRegExPattern(selectedType, isRegEx, regEx);
  errors.triggerPhrases = validateTriggerPhrases(selectedType, isRegEx, intent, triggerPhrases);
  return errors;
};

export interface LuFilePayload {
  id: string;
  content: string;
}

export interface QnAFilePayload {
  id: string;
  content: string;
}
// -------------------- TriggerCreationModal -------------------- //

interface TriggerCreationModalProps {
  dialogId: string;
  isOpen: boolean;
  onDismiss: () => void;
  onSubmit: (dialog: DialogInfo, luFilePayload?: LuFilePayload, QnAFilePayload?: QnAFilePayload) => void;
}

export const TriggerCreationModal: React.FC<TriggerCreationModalProps> = (props) => {
  const { isOpen, onDismiss, onSubmit, dialogId } = props;
  const { state } = useStoreContext();
  const { dialogs, luFiles, qnaFiles, locale, projectId, schemas, userSettings } = state;
  const luFile = luFiles.find(({ id }) => id === `${dialogId}.${locale}`);
  const dialogFile = dialogs.find((dialog) => dialog.id === dialogId);
  const isRegEx = (dialogFile?.content?.recognizer?.$kind ?? '') === regexRecognizerKey;
  const recognizer = get(dialogFile, 'content.recognizer', '');
  const isLUISnQnA = typeof recognizer === 'string' && recognizer.endsWith('.qna');
  const regexIntents = dialogFile?.content?.recognizer?.intents ?? [];
  const qnaFile = qnaFiles.find(({ id }) => id === `${dialogId}.${locale}`);

  const initialFormData: TriggerFormData = {
    errors: initialFormDataErrors,
    $kind: intentTypeKey,
    event: '',
    intent: '',
    triggerPhrases: '',
    qnaPhrases: qnaFile ? qnaFile.content : '',
    regEx: '',
  };
  const [formData, setFormData] = useState(initialFormData);
  const [selectedType, setSelectedType] = useState(intentTypeKey);
  const showIntentName = selectedType === intentTypeKey || selectedType === adaptiveCardKey;
  const showRegExDropDown = selectedType === intentTypeKey && isRegEx;
  const showTriggerPhrase = selectedType === intentTypeKey && !isRegEx;
  const showEventDropDown = selectedType === eventTypeKey;
  const showActivityDropDown = selectedType === activityTypeKey;
  const showCustomEvent = selectedType === customEventKey;
  const showQnAPhrase = selectedType === qnaMatcherKey;

  const eventTypes: IComboBoxOption[] = getEventTypes();
  const activityTypes: IDropdownOption[] = getActivityTypes();
  let triggerTypeOptions: IDropdownOption[] = getTriggerTypes();
  if (isRegEx) {
    let index = triggerTypeOptions.findIndex((t) => t.key === qnaMatcherKey);
    triggerTypeOptions[index].data = { icon: 'Warning' };
    index = triggerTypeOptions.findIndex((t) => t.key === onChooseIntentKey);
    triggerTypeOptions[index].data = { icon: 'Warning' };
  }
  if (!isLUISnQnA && !isRegEx) {
    triggerTypeOptions = triggerTypeOptions.filter((t) => t.key !== adaptiveCardKey);
  }
  useEffect(() => {
    setFormData({ ...formData, qnaPhrases: qnaFile ? qnaFile.content : '' });
  }, [qnaFile]);

  const onRenderOption = (option: IDropdownOption) => {
    return (
      <div css={optionRow}>
        {option.text}
        {option.data && option.data.icon && <Icon iconName={option.data.icon} style={warningIcon} />}
        {option.data && option.data.icon && <div css={warningText}>{'Not supported with Regex'} </div>}
      </div>
    );
  };
  const shouldDisable = (errors: TriggerFormDataErrors) => {
    for (const key in errors) {
      if (errors[key]) {
        return true;
      }
    }
    return false;
  };

  const onClickSubmitButton = (e) => {
    e.preventDefault();

    //If still have some errors here, it is a bug.
    const errors = validateForm(selectedType, formData, isRegEx, regexIntents);
    if (shouldDisable(errors)) {
      setFormData({
        ...formData,
        errors,
      });
      return;
    }
    const content = luFile?.content ?? '';
    const luFileId = luFile?.id || `${dialogId}.${locale}`;
    if (formData.$kind === adaptiveCardKey) {
      formData.$kind = intentTypeKey;
    }
    const newDialog = generateNewDialog(dialogs, dialogId, formData, schemas.sdk?.content);
    if (formData.$kind === intentTypeKey && !isRegEx) {
      const newContent = addIntent(content, { Name: formData.intent, Body: formData.triggerPhrases });
      const updateLuFile = {
        id: luFileId,
        content: newContent,
      };
      onSubmit(newDialog, updateLuFile);
    } else if (formData.$kind === qnaMatcherKey) {
      const qnaFileId = qnaFile?.id || `${dialogId}.${locale}`;
      const qnaFilePayload: QnAFilePayload = { id: qnaFileId, content: formData.qnaPhrases };
      onSubmit(newDialog, undefined, qnaFilePayload);
    } else {
      onSubmit(newDialog);
    }
    onDismiss();
  };

  const onSelectTriggerType = (e, option) => {
    setSelectedType(option.key || '');
    const compoundTypes = [activityTypeKey, eventTypeKey];
    const isCompound = compoundTypes.some((t) => option.key === t);
    let newFormData: TriggerFormData = initialFormData;
    if (isCompound) {
      newFormData = { ...newFormData, $kind: '' };
    } else {
      newFormData = { ...newFormData, $kind: option.key === customEventKey ? SDKKinds.OnDialogEvent : option.key };
    }
    setFormData({ ...newFormData, errors: initialFormDataErrors });
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

  const handleEventTypeChange = (e: React.FormEvent, option?: IDropdownOption) => {
    if (option) {
      const errors: TriggerFormDataErrors = {};
      errors.event = validateEventKind(selectedType, option.key as string);
      setFormData({ ...formData, $kind: option.key as string, errors: { ...formData.errors, ...errors } });
    }
  };

  const onNameChange = (e, name) => {
    const errors: TriggerFormDataErrors = {};
    errors.intent = validateIntentName(selectedType, name);
    if (showTriggerPhrase) {
      errors.triggerPhrases = getLuDiagnostics(name, formData.triggerPhrases);
    }
    setFormData({ ...formData, intent: name, errors: { ...formData.errors, ...errors } });
  };

  const onChangeRegEx = (e, pattern) => {
    const errors: TriggerFormDataErrors = {};
    errors.regEx = validateRegExPattern(selectedType, isRegEx, pattern);
    setFormData({ ...formData, regEx: pattern, errors: { ...formData.errors, ...errors } });
  };

  const onTriggerPhrasesChange = (body: string) => {
    const errors: TriggerFormDataErrors = {};
    errors.triggerPhrases = getLuDiagnostics(formData.intent, body);
    setFormData({ ...formData, triggerPhrases: body, errors: { ...formData.errors, ...errors } });
  };

  const onQnAPhrasesChange = (body: string) => {
    const errors: TriggerFormDataErrors = {};
    errors.qnaPhrases = getQnADiagnostics(body);
    setFormData({ ...formData, qnaPhrases: body, errors: { ...formData.errors, ...errors } });
  };

  const errors = validateForm(selectedType, formData, isRegEx, regexIntents);
  const disable = shouldDisable(errors);
  return (
    <Dialog
      dialogContentProps={{
        type: DialogType.normal,
        title: formatMessage('Create a trigger'),
        styles: styles.dialog,
      }}
      hidden={!isOpen}
      modalProps={{
        isBlocking: false,
        styles: styles.modal,
      }}
      onDismiss={onDismiss}
    >
      <div css={dialogWindow}>
        <Stack>
          <Dropdown
            data-testid={'triggerTypeDropDown'}
            defaultSelectedKey={selectedType}
            errorMessage={formData.errors.$kind}
            label={formatMessage('What is the type of this trigger?')}
            options={triggerTypeOptions}
            styles={dropdownStyles}
            onChange={onSelectTriggerType}
            //@ts-ignore：
            onRenderOption={onRenderOption}
          />
          {showEventDropDown && (
            <Dropdown
              data-testid={'eventTypeDropDown'}
              errorMessage={formData.errors.event}
              label={formatMessage('Which event?')}
              options={eventTypes}
              placeholder={formatMessage('Select an event type')}
              styles={dropdownStyles}
              onChange={handleEventTypeChange}
            />
          )}
          {showCustomEvent && (
            <TextField
              data-testid="CustomEventName"
              errorMessage={formData.errors.event}
              label={formatMessage('What is the name of the custom event?')}
              styles={intent}
              onChange={handleEventNameChange}
            />
          )}
          {showActivityDropDown && (
            <Dropdown
              data-testid={'activityTypeDropDown'}
              errorMessage={formData.errors.activity}
              label={formatMessage('Which activity type?')}
              options={activityTypes}
              placeholder={formatMessage('Select an activity type')}
              styles={dropdownStyles}
              onChange={handleEventTypeChange}
            />
          )}
          {showIntentName && (
            <TextField
              data-testid="TriggerName"
              errorMessage={formData.errors.intent}
              label={
                isRegEx
                  ? formatMessage('What is the name of this trigger (RegEx)')
                  : formatMessage('What is the name of this trigger (LUIS + QnA)')
              }
              styles={intent}
              onChange={onNameChange}
            />
          )}

          {showRegExDropDown && (
            <TextField
              data-testid="RegExField"
              errorMessage={formData.errors.regEx}
              label={formatMessage('Please input regex pattern')}
              onChange={onChangeRegEx}
            />
          )}
          {showTriggerPhrase && (
            <React.Fragment>
              <Label>{formatMessage('Trigger phrases')}</Label>
              <LuEditor
                editorSettings={userSettings.codeEditor}
                errorMessage={formData.errors.triggerPhrases}
                height={225}
                luOption={{
                  projectId,
                  fileId: dialogId,
                  sectionId: formData.intent || PlaceHolderSectionName,
                }}
                placeholder={inlineModePlaceholder}
                value={formData.triggerPhrases}
                onChange={onTriggerPhrasesChange}
              />
            </React.Fragment>
          )}
          {showQnAPhrase && (
            <React.Fragment>
              <Label>{formatMessage('QnA phrases')}</Label>
              <LuEditor
                editorSettings={userSettings.codeEditor}
                errorMessage={formData.errors.qnaPhrases}
                height={225}
                placeholder={defaultQnAPlaceholder}
                value={formData.qnaPhrases}
                onChange={onQnAPhrasesChange}
              />
            </React.Fragment>
          )}
        </Stack>
      </div>
      <DialogFooter>
        <DefaultButton text={formatMessage('Cancel')} onClick={onDismiss} />
        <PrimaryButton
          data-testid={'triggerFormSubmit'}
          disabled={disable}
          text={formatMessage('Submit')}
          onClick={onClickSubmitButton}
        />
      </DialogFooter>
    </Dialog>
  );
};

export default TriggerCreationModal;
