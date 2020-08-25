// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useState } from 'react';
import formatMessage from 'format-message';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { luIndexer, combineMessage } from '@bfc/indexers';
import { PlaceHolderSectionName } from '@bfc/indexers/lib/utils/luUtil';
import { SDKKinds } from '@bfc/shared';
import { LuEditor, inlineModePlaceholder } from '@bfc/code-editor';
import { IComboBoxOption } from 'office-ui-fabric-react/lib/ComboBox';
import { useRecoilValue } from 'recoil';
import { FontWeights } from '@uifabric/styling';
import { FontSizes } from '@uifabric/fluent-theme';

import {
  getTriggerTypes,
  TriggerFormData,
  TriggerFormDataErrors,
  eventTypeKey,
  customEventKey,
  intentTypeKey,
  activityTypeKey,
  getEventTypes,
  getActivityTypes,
  qnaMatcherKey,
  onChooseIntentKey,
} from '../../utils/dialogUtil';
import { projectIdState } from '../../recoilModel/atoms/botState';
import { userSettingsState } from '../../recoilModel';
import { nameRegex } from '../../constants';
import { validatedDialogsSelector } from '../../recoilModel/selectors/validatedDialogs';
import { isRegExRecognizerType, isLUISnQnARecognizerType } from '../../utils/dialogValidator';
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

const optionRow = {
  display: 'flex',
  height: 15,
  fontSize: 15,
};

export const warningIcon = {
  marginLeft: 5,
  color: '#BE880A',
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
    return formatMessage(`RegEx {intent} is already defined`, { intent });
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
  if (selectedType === intentTypeKey && !isRegEx && triggerPhrases) {
    return getLuDiagnostics(intent, triggerPhrases);
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

// -------------------- TriggerCreationModal -------------------- //

interface TriggerCreationModalProps {
  dialogId: string;
  isOpen: boolean;
  onDismiss: () => void;
  onSubmit: (dialogId: string, formData: TriggerFormData) => void;
}

export const TriggerCreationModal: React.FC<TriggerCreationModalProps> = (props) => {
  const { isOpen, onDismiss, onSubmit, dialogId } = props;
  const dialogs = useRecoilValue(validatedDialogsSelector);

  const projectId = useRecoilValue(projectIdState);
  const userSettings = useRecoilValue(userSettingsState);
  const dialogFile = dialogs.find((dialog) => dialog.id === dialogId);
  const isRegEx = isRegExRecognizerType(dialogFile);
  const isLUISnQnA = isLUISnQnARecognizerType(dialogFile);
  const regexIntents = dialogFile?.content?.recognizer?.intents ?? [];
  const initialFormData: TriggerFormData = {
    errors: initialFormDataErrors,
    $kind: intentTypeKey,
    event: '',
    intent: '',
    triggerPhrases: '',
    regEx: '',
  };
  const [formData, setFormData] = useState(initialFormData);
  const [selectedType, setSelectedType] = useState(intentTypeKey);
  const showIntentName = selectedType === intentTypeKey;
  const showRegExDropDown = selectedType === intentTypeKey && isRegEx;
  const showTriggerPhrase = selectedType === intentTypeKey && isLUISnQnA;
  const showEventDropDown = selectedType === eventTypeKey;
  const showActivityDropDown = selectedType === activityTypeKey;
  const showCustomEvent = selectedType === customEventKey;
  const eventTypes: IComboBoxOption[] = getEventTypes();
  const activityTypes: IDropdownOption[] = getActivityTypes();
  const triggerTypeOptions: IDropdownOption[] = getTriggerTypes();

  if (isRegEx) {
    const qnaMatcherOption = triggerTypeOptions.find((t) => t.key === qnaMatcherKey);
    if (qnaMatcherOption) {
      qnaMatcherOption.data = { icon: 'Warning' };
    }
    const onChooseIntentOption = triggerTypeOptions.find((t) => t.key === onChooseIntentKey);
    if (onChooseIntentOption) {
      onChooseIntentOption.data = { icon: 'Warning' };
    }
  }

  const onRenderOption = (option: IDropdownOption) => {
    return (
      <div css={optionRow}>
        {option.text}
        {option.data && option.data.icon && <Icon iconName={option.data.icon} style={warningIcon} />}
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
      setFormData({ ...formData, errors });
      return;
    }
    onDismiss();
    onSubmit(dialogId, formData);
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
    if (showTriggerPhrase && formData.triggerPhrases) {
      errors.triggerPhrases = getLuDiagnostics(name, formData.triggerPhrases);
    }
    setFormData({ ...formData, intent: name, errors: { ...formData.errors, ...errors } });
  };

  const onChangeRegEx = (e, pattern) => {
    const errors: TriggerFormDataErrors = {};
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
              required
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
                  : isLUISnQnA
                  ? formatMessage('What is the name of this trigger (LUIS)')
                  : formatMessage('What is the name of this trigger')
              }
              styles={intent}
              onChange={onNameChange}
            />
          )}

          {showRegExDropDown && (
            <TextField
              data-testid="RegExField"
              errorMessage={formData.errors.regEx}
              label={formatMessage('Please input regEx pattern')}
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
