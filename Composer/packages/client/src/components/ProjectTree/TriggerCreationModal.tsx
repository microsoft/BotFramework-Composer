// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useContext } from 'react';
import formatMessage from 'format-message';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { DialogInfo, luIndexer, combineMessage } from '@bfc/indexers';
import get from 'lodash/get';
import { LuEditor } from '@bfc/code-editor';
import { Pivot, PivotItem } from 'office-ui-fabric-react/lib/Pivot';

import {
  generateNewDialog,
  getTriggerTypes,
  TriggerFormData,
  TriggerFormDataErrors,
  eventTypeKey,
  intentTypeKey,
  activityTypeKey,
  messageTypeKey,
  getEventTypes,
  getActivityTypes,
  getMessageTypes,
  regexRecognizerKey,
  ValueRecognizerKey,
  recognizerTemplates,
  LuisRecognizerKey,
} from '../../utils/dialogUtil';
import { addIntent } from '../../utils/luUtil';
import { StoreContext } from '../../store';

import { styles, dropdownStyles, dialogWindow, intent } from './styles';

const nameRegex = /^[a-zA-Z0-9-_.]+$/;
const validateForm = (
  data: TriggerFormData,
  regExIntents: [{ intent: string; pattern: string }]
): TriggerFormDataErrors => {
  const errors: TriggerFormDataErrors = {};
  const { $type, specifiedType, intent } = data;

  if ($type === eventTypeKey && !specifiedType) {
    errors.specifiedType = formatMessage('Please select a event type');
  }

  if ($type === activityTypeKey && !specifiedType) {
    errors.specifiedType = formatMessage('Please select an activity type');
  }

  if ($type === messageTypeKey && !specifiedType) {
    errors.specifiedType = formatMessage('Please select a message type');
  }

  if (!$type) {
    errors.$type = formatMessage('Please select a trigger type');
  }

  if ($type === intentTypeKey && (!intent || !nameRegex.test(intent))) {
    errors.intent = formatMessage(
      'Spaces and special characters are not allowed. Use letters, numbers, -, or _., numbers, -, and _'
    );
  }

  if ($type === intentTypeKey && regExIntents.find(ri => ri.intent === intent)) {
    errors.intent = `regEx ${intent} is already defined`;
  }

  //luis grammar error
  if (data.errors.triggerPhrases) {
    errors.triggerPhrases = data.errors.triggerPhrases;
  }
  return errors;
};

export interface LuFilePayload {
  id: string;
  content: string;
}

interface TriggerCreationModalProps {
  dialogId: string;
  isOpen: boolean;
  onDismiss: () => void;
  onSubmit: (dialog: DialogInfo, luFilePayload?: LuFilePayload) => void;
}

export const TriggerCreationModal: React.FC<TriggerCreationModalProps> = props => {
  const { isOpen, onDismiss, onSubmit, dialogId } = props;
  const { state } = useContext(StoreContext);
  const { dialogs, luFiles, locale, projectId } = state;
  const luFile = luFiles.find(({ id }) => id === `${dialogId}.${locale}`);
  const dialogFile = dialogs.find(dialog => dialog.id === dialogId);
  const currentRecognizerTypes = get(
    dialogFile,
    `content.recognizer.recognizers[0].recognizers['en-us'].recognizers`,
    []
  );

  const generateValidRecognizerTypes = () => {
    const res = [ValueRecognizerKey];
    currentRecognizerTypes.forEach(element => {
      if (element === `${dialogId}.lu`) {
        res.push(LuisRecognizerKey);
      }
      if (element.$type === regexRecognizerKey) {
        res.push(regexRecognizerKey);
      }
    });
    return res;
  };

  const validRecognizerTypes = generateValidRecognizerTypes();

  const firstValidType = recognizerTemplates.find(t => validRecognizerTypes.includes(t.key))?.key;
  const initialFormData: TriggerFormData = {
    errors: {},
    $type: '',
    recognizerType: firstValidType ? firstValidType : ValueRecognizerKey,
    specifiedType: '',
    intent: '',
    triggerPhrases: '',
    regexEx: '',
  };
  const [formData, setFormData] = useState({ ...initialFormData, $type: intentTypeKey });
  const isRegEx = formData.recognizerType === regexRecognizerKey;
  const regexIntents = get(dialogFile, 'content.recognizer.intents', []);
  const isValue = formData.recognizerType === ValueRecognizerKey;
  const isLUIS = formData.recognizerType === LuisRecognizerKey;

  const onClickSubmitButton = e => {
    e.preventDefault();
    const errors = validateForm(formData, regexIntents);

    if (Object.keys(errors).length) {
      setFormData({
        ...formData,
        errors,
      });
      return;
    }

    const content = get(luFile, 'content', '');
    const luFileId = luFile?.id || `${dialogId}.${locale}`;
    const newDialog = generateNewDialog(dialogs, dialogId, formData);
    if (formData.$type === intentTypeKey && formData.triggerPhrases) {
      const newContent = addIntent(content, { Name: formData.intent, Body: formData.triggerPhrases });
      const updateLuFile = {
        id: luFileId,
        content: newContent,
      };
      onSubmit(newDialog, updateLuFile);
    } else {
      onSubmit(newDialog);
    }
    onDismiss();
  };

  const onSelectTriggerType = (e, option) => {
    const data = { ...initialFormData, $type: option.key };
    setFormData(data);
  };

  const onSelectSpecifiedTypeType = (e, option) => {
    setFormData({ ...formData, specifiedType: option.key });
  };

  const onNameChange = (e, name) => {
    setFormData({ ...formData, intent: name });
  };

  const onChangeRegEx = (e, pattern) => {
    setFormData({ ...formData, regexEx: pattern });
  };

  const onChangeRecognizerType = (item, e) => {
    setFormData({
      ...formData,
      recognizerType: item.props.itemKey,
    });
  };

  const onTriggerPhrasesChange = (body: string) => {
    const errors = formData.errors;
    const content = '#' + formData.intent + '\n' + body;
    const { diagnostics } = luIndexer.parse(content);
    errors.triggerPhrases = combineMessage(diagnostics);
    setFormData({ ...formData, triggerPhrases: body, errors });
  };

  const eventTypes: IDropdownOption[] = getEventTypes();
  const activityTypes: IDropdownOption[] = getActivityTypes();
  const messageTypes: IDropdownOption[] = getMessageTypes();
  const triggerTypeOptions: IDropdownOption[] = getTriggerTypes();
  const showIntentName = formData.$type === intentTypeKey;
  const showRegExField = formData.$type === intentTypeKey && isRegEx;
  const showTriggerPhrase = formData.$type === intentTypeKey && isLUIS;
  const showEventDropDown = formData.$type === eventTypeKey;
  const showActivityDropDown = formData.$type === activityTypeKey;
  const showMessageDropDown = formData.$type === messageTypeKey;

  return (
    <Dialog
      hidden={!isOpen}
      onDismiss={onDismiss}
      dialogContentProps={{
        type: DialogType.normal,
        title: formatMessage('Create a trigger'),
        styles: styles.dialog,
      }}
      modalProps={{
        isBlocking: false,
        styles: styles.modal,
      }}
    >
      <div css={dialogWindow}>
        <Stack>
          <Dropdown
            label={formatMessage('What is the type of this trigger?')}
            options={triggerTypeOptions}
            styles={dropdownStyles}
            onChange={onSelectTriggerType}
            selectedKey={formData.$type}
            errorMessage={formData.errors.$type}
            data-testid={'triggerTypeDropDown'}
            required
          />
          {formData.$type === intentTypeKey && (
            <Pivot
              data-testid="triggerRecognizerType"
              onLinkClick={onChangeRecognizerType}
              defaultSelectedKey={formData.recognizerType}
            >
              {recognizerTemplates.map(r => (
                <PivotItem
                  ariaLabel={r.text}
                  headerText={r.text}
                  key={r.key}
                  itemKey={r.key}
                  headerButtonProps={{
                    disabled: !validRecognizerTypes.includes(r.key),
                  }}
                />
              ))}
            </Pivot>
          )}
          {showEventDropDown && (
            <Dropdown
              placeholder={formatMessage('Select a event type')}
              label={formatMessage('Which event?')}
              options={eventTypes}
              styles={dropdownStyles}
              onChange={onSelectSpecifiedTypeType}
              errorMessage={formData.errors.specifiedType}
              data-testid={'eventTypeDropDown'}
              required
            />
          )}
          {showActivityDropDown && (
            <Dropdown
              placeholder={formatMessage('Select an activity type')}
              label={formatMessage('Which activity type')}
              options={activityTypes}
              styles={dropdownStyles}
              onChange={onSelectSpecifiedTypeType}
              errorMessage={formData.errors.specifiedType}
              data-testid={'activityTypeDropDown'}
              required
            />
          )}
          {showMessageDropDown && (
            <Dropdown
              placeholder={formatMessage('Select a message type')}
              label={formatMessage('Which message type?')}
              options={messageTypes}
              styles={dropdownStyles}
              onChange={onSelectSpecifiedTypeType}
              errorMessage={formData.errors.specifiedType}
              data-testid={'messageTypeDropDown'}
              required
            />
          )}
          {showIntentName && (
            <TextField
              label={
                isValue
                  ? formatMessage('What is the name of this trigger')
                  : isRegEx
                  ? formatMessage('What is the name of this trigger (RegEx)')
                  : formatMessage('What is the name of this trigger (Luis)')
              }
              styles={intent}
              onChange={onNameChange}
              errorMessage={formData.errors.intent}
              data-testid="TriggerName"
              required
            />
          )}

          {showRegExField && (
            <TextField
              label={formatMessage('Please input regex pattern')}
              onChange={onChangeRegEx}
              errorMessage={formData.errors.regexEx}
              data-testid={'RegExDropDown'}
              value={formData.regexEx}
            />
          )}
          {showTriggerPhrase && <Label>{formatMessage('Trigger phrases')}</Label>}
          {showTriggerPhrase && (
            <LuEditor
              onChange={onTriggerPhrasesChange}
              value={formData.triggerPhrases}
              errorMsg={formData.errors.triggerPhrases}
              hidePlaceholder={true}
              luOption={{
                projectId,
                fileId: dialogId,
                sectionId: formData.intent || 'newSection',
              }}
              options={{
                lineNumbers: 'off',
                minimap: {
                  enabled: false,
                },
                lineDecorationsWidth: 10,
                lineNumbersMinChars: 0,
                glyphMargin: false,
                folding: false,
                renderLineHighlight: 'none',
              }}
              height={150}
            />
          )}
        </Stack>
      </div>
      <DialogFooter>
        <DefaultButton onClick={onDismiss} text={formatMessage('Cancel')} />
        <PrimaryButton onClick={onClickSubmitButton} text={formatMessage('Submit')} data-testid={'triggerFormSubmit'} />
      </DialogFooter>
    </Dialog>
  );
};
