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
import { Pivot, PivotItem } from 'office-ui-fabric-react/lib/Pivot';
import { luIndexer, combineMessage } from '@bfc/indexers';
import get from 'lodash/get';
import { DialogInfo } from '@bfc/shared';
import { LuEditor } from '@bfc/code-editor';

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
  QnARecognizerKey,
  ValueRecognizerKey,
  recognizerTemplates,
  LuisRecognizerKey,
  CrossTrainedRecognizerSetKey,
} from '../../utils/dialogUtil';
import { addIntent as luAddIntent } from '../../utils/luUtil';
import { addIntent as qnaAddIntent } from '../../utils/qnaUtil';
import { StoreContext } from '../../store';

import { styles, dropdownStyles, dialogWindow, intent } from './styles';
const nameRegex = /^[a-zA-Z0-9-_.]+$/;
const validateForm = (
  data: TriggerFormData,
  regExIntents: [{ intent: string; pattern: string }],
  isLUIS: boolean,
  isRegEx: boolean
): TriggerFormDataErrors => {
  const errors: TriggerFormDataErrors = {};
  const { $kind, specifiedType, intent } = data;

  if ($kind === eventTypeKey && !specifiedType) {
    errors.specifiedType = formatMessage('Please select a event type');
  }

  if ($kind === activityTypeKey && !specifiedType) {
    errors.specifiedType = formatMessage('Please select an activity type');
  }

  if ($kind === messageTypeKey && !specifiedType) {
    errors.specifiedType = formatMessage('Please select a message type');
  }

  if (!$kind) {
    errors.$kind = formatMessage('Please select a trigger type');
  }

  if ($kind === intentTypeKey && (!intent || !nameRegex.test(intent))) {
    errors.intent = formatMessage(
      'Spaces and special characters are not allowed. Use letters, numbers, -, or _., numbers, -, and _'
    );
  }

  if ($kind === intentTypeKey && isRegEx && regExIntents.find(ri => ri.intent === intent)) {
    errors.intent = `regEx ${intent} is already defined`;
  }

  //luis grammar error
  if (data.errors.triggerPhrases) {
    errors.triggerPhrases = data.errors.triggerPhrases;
  }
  return errors;
};

export interface OtherFilePayLoad {
  luFile?: LuFilePayload;
  qnaFile?: QnAFilePayLoad;
}
export interface LuFilePayload {
  id: string;
  content: string;
}

export interface QnAFilePayLoad {
  id: string;
  content: string;
}

interface TriggerCreationModalProps {
  dialogId: string;
  isOpen: boolean;
  onDismiss: () => void;
  onSubmit: (dialog: DialogInfo, otherFilePayLoad?: OtherFilePayLoad) => void;
}

export const TriggerCreationModal: React.FC<TriggerCreationModalProps> = props => {
  const { isOpen, onDismiss, onSubmit, dialogId } = props;
  const { state } = useContext(StoreContext);
  const { dialogs, luFiles, qnaFiles, locale, projectId, schemas } = state;
  const luFile = luFiles.find(({ id }) => id === `${dialogId}.${locale}`);
  const qnaFile = qnaFiles.find(({ id }) => id === `${dialogId}.${locale}`);
  const dialogFile = dialogs.find(dialog => dialog.id === dialogId);
  const currentRecognizerType = get(dialogFile, `content.recognizer.recognizers[0].recognizers['en-us']`, '');

  const generateValidRecognizerTypes = () => {
    const res = [ValueRecognizerKey];
    if (currentRecognizerType === `${dialogId}.lu`) {
      res.push(LuisRecognizerKey);
    }
    if (currentRecognizerType === `${dialogId}.qna`) {
      res.push(QnARecognizerKey);
    }
    if (currentRecognizerType.$kind === regexRecognizerKey) {
      res.push(regexRecognizerKey);
    }
    if (currentRecognizerType.$kind === QnARecognizerKey) {
      res.push(QnARecognizerKey);
    }
    if (currentRecognizerType.$kind === CrossTrainedRecognizerSetKey) {
      res.push(LuisRecognizerKey);
      res.push(QnARecognizerKey);
    }
    return res;
  };

  const validRecognizerTypes = generateValidRecognizerTypes();

  const firstValidType = recognizerTemplates.find(t => validRecognizerTypes.includes(t.key))?.key;
  const initialFormData: TriggerFormData = {
    errors: {},
    $kind: '',
    recognizerType: firstValidType ? firstValidType : ValueRecognizerKey,
    specifiedType: '',
    intent: '',
    triggerPhrases: '',
    regexEx: '',
    qnaPhrase: '',
  };
  const [formData, setFormData] = useState({ ...initialFormData, $kind: intentTypeKey });
  const regexIntents = get(dialogFile, `content.recognizer.recognizers[0].recognizers['en-us'].intents`, []);
  const isRegEx =
    get(dialogFile, `content.recognizer.recognizers[0].recognizers['en-us'].$kind`, '') === regexRecognizerKey;
  const isLUIS = get(dialogFile, `content.recognizer.recognizers[0].recognizers['en-us']`, '') === `${dialogId}.lu`;

  const onClickSubmitButton = e => {
    e.preventDefault();
    const errors = validateForm(formData, regexIntents, isLUIS, isRegEx);

    if (Object.keys(errors).length) {
      setFormData({
        ...formData,
        errors,
      });
      return;
    }

    const luContent = get(luFile, 'content', '');
    const qnaContent = get(qnaFile, 'content', '');
    const luFileId = luFile?.id || `${dialogId}.${locale}`;
    const qnaFileId = qnaFile?.id || `${dialogId}.${locale}`;
    const newDialog = generateNewDialog(dialogs, dialogId, formData, schemas.sdk?.content);
    if (formData.$kind === intentTypeKey) {
      const otherFilePayLoad: OtherFilePayLoad = {};
      if (formData.triggerPhrases) {
        const newContent = luAddIntent(luContent, { Name: formData.intent, Body: formData.triggerPhrases });
        const updateLuFile = {
          id: luFileId,
          content: newContent,
        };
        otherFilePayLoad.luFile = updateLuFile;
      }

      if (formData.qnaPhrase) {
        const newContent = qnaAddIntent(qnaContent, { Name: formData.intent, Body: formData.qnaPhrase });
        const updateQnaFile = {
          id: qnaFileId,
          content: newContent,
        };
        otherFilePayLoad.qnaFile = updateQnaFile;
      }

      onSubmit(newDialog, otherFilePayLoad);
    } else {
      onSubmit(newDialog);
    }
    onDismiss();
  };

  const onSelectTriggerType = (e, option) => {
    const data = { ...initialFormData, $kind: option.key };
    setFormData(data);
  };

  const onSelectSpecifiedTypeType = (e, option) => {
    setFormData({ ...formData, specifiedType: option.key });
  };

  const onChangeName = (e, name) => {
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

  const onChangeTriggerPhrases = (body: string) => {
    const errors = formData.errors;
    const content = '#' + formData.intent + '\n' + body;
    const { diagnostics } = luIndexer.parse(content);
    errors.triggerPhrases = combineMessage(diagnostics);
    setFormData({ ...formData, triggerPhrases: body, errors });
  };

  const onChangeQnAPhrase = (e, body) => {
    setFormData({ ...formData, qnaPhrase: body });
  };

  const eventTypes: IDropdownOption[] = getEventTypes();
  const activityTypes: IDropdownOption[] = getActivityTypes();
  const messageTypes: IDropdownOption[] = getMessageTypes();
  const triggerTypeOptions: IDropdownOption[] = getTriggerTypes();
  const showIntentName = formData.$kind === intentTypeKey;
  const showRegExField = formData.$kind === intentTypeKey && formData.recognizerType === regexRecognizerKey;
  const showTriggerPhrase = formData.$kind === intentTypeKey && formData.recognizerType === LuisRecognizerKey;
  const showQnAPhrase = formData.recognizerType === QnARecognizerKey;
  const showEventDropDown = formData.$kind === eventTypeKey;
  const showActivityDropDown = formData.$kind === activityTypeKey;
  const showMessageDropDown = formData.$kind === messageTypeKey;

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
            selectedKey={formData.$kind}
            errorMessage={formData.errors.$kind}
            data-testid={'triggerTypeDropDown'}
            required
          />
          {formData.$kind === intentTypeKey && (
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
              label={formatMessage('What is the name of this trigger')}
              styles={intent}
              onChange={onChangeName}
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
              onChange={onChangeTriggerPhrases}
              value={formData.triggerPhrases}
              errorMessage={formData.errors.triggerPhrases}
              hidePlaceholder={true}
              luOption={{
                projectId,
                fileId: dialogId,
                sectionId: formData.intent || 'newSection',
              }}
              height={150}
            />
          )}
          {showQnAPhrase && (
            <TextField
              label={formatMessage('QnA Phrase')}
              onChange={onChangeQnAPhrase}
              data-testid={'QnAPhraseField'}
              value={formData.qnaPhrase}
              multiline
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
