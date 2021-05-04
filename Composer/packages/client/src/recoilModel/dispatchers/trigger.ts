// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */
import { useRecoilCallback, CallbackInterface } from 'recoil';
import { BaseSchema, deleteActions, ITriggerCondition, LgTemplate, LgTemplateSamples, SDKKinds } from '@bfc/shared';
import get from 'lodash/get';

import { schemasState, dialogState, localeState } from '../atoms/botState';
import { dialogsSelectorFamily, luFilesSelectorFamily, skillNameIdentifierByProjectIdSelector } from '../selectors';
import {
  onChooseIntentKey,
  generateNewDialog,
  intentTypeKey,
  qnaMatcherKey,
  TriggerFormData,
} from '../../utils/dialogUtil';
import { lgFilesSelectorFamily } from '../selectors/lg';
import { dispatcherState } from '../atoms';
import { createActionFromManifest } from '../utils/skill';

import { setError } from './shared';

const defaultQnATriggerData = {
  $kind: qnaMatcherKey,
  errors: { $kind: '', intent: '', event: '', triggerPhrases: '', regEx: '', activity: '' },
  event: '',
  intent: '',
  regEx: '',
  triggerPhrases: '',
};

const getDesignerIdFromDialogPath = (dialog, path) => {
  const value = get(dialog, path, '');
  const startIndex = value.lastIndexOf('_');
  const endIndex = value.indexOf('()');
  const designerId = value.substring(startIndex + 1, endIndex);
  if (!designerId) throw new Error(`missing designerId in path: ${path}`);
  return designerId;
};

const getNewDialogWithTrigger = async (
  callbackHelpers: CallbackInterface,
  projectId: string,
  dialogId: string,
  formData: TriggerFormData,
  createLuIntent,
  createLgTemplates
) => {
  const { snapshot } = callbackHelpers;
  const lgFiles = await snapshot.getPromise(lgFilesSelectorFamily(projectId));
  const luFiles = await snapshot.getPromise(luFilesSelectorFamily(projectId));
  const dialogs = await snapshot.getPromise(dialogsSelectorFamily(projectId));
  const dialog = await snapshot.getPromise(dialogState({ projectId, dialogId }));
  const schemas = await snapshot.getPromise(schemasState(projectId));
  const locale = await snapshot.getPromise(localeState(projectId));

  const lgFile = lgFiles.find((file) => file.id === `${dialogId}.${locale}`);
  const luFile = luFiles.find((file) => file.id === `${dialogId}.${locale}`);

  if (!luFile) throw new Error(`lu file ${dialogId} not found`);
  if (!lgFile) throw new Error(`lg file ${dialogId} not found`);
  if (!dialog) throw new Error(`dialog ${dialogId} not found`);
  const newDialog = generateNewDialog(dialogs, dialog.id, formData, schemas.sdk?.content);
  const index = get(newDialog, 'content.triggers', []).length - 1;
  if (formData.$kind === intentTypeKey && formData.triggerPhrases) {
    const intent = { Name: formData.intent, Body: formData.triggerPhrases };
    luFile && (await createLuIntent({ id: luFile.id, intent, projectId }));
  } else if (formData.$kind === qnaMatcherKey) {
    const designerId1 = getDesignerIdFromDialogPath(
      newDialog,
      `content.triggers[${index}].actions[0].actions[1].prompt`
    );
    const designerId2 = getDesignerIdFromDialogPath(
      newDialog,
      `content.triggers[${index}].actions[0].elseActions[0].activity`
    );
    const lgTemplates: LgTemplate[] = [
      LgTemplateSamples.TextInputPromptForQnAMatcher(designerId1) as LgTemplate,
      LgTemplateSamples.SendActivityForQnAMatcher(designerId2) as LgTemplate,
    ];
    await createLgTemplates({ id: lgFile.id, templates: lgTemplates, projectId });
  } else if (formData.$kind === onChooseIntentKey) {
    const designerId1 = getDesignerIdFromDialogPath(newDialog, `content.triggers[${index}].actions[2].prompt`);
    const designerId2 = getDesignerIdFromDialogPath(
      newDialog,
      `content.triggers[${index}].actions[3].elseActions[0].activity`
    );
    const lgTemplates: LgTemplate[] = [
      LgTemplateSamples.textInputPromptForOnChooseIntent(designerId1) as LgTemplate,
      LgTemplateSamples.onChooseIntentAdaptiveCard(designerId1) as LgTemplate,
      LgTemplateSamples.whichOneDidYouMean(designerId1) as LgTemplate,
      LgTemplateSamples.pickOne(designerId1) as LgTemplate,
      LgTemplateSamples.getAnswerReadBack(designerId1) as LgTemplate,
      LgTemplateSamples.getIntentReadBack(designerId1) as LgTemplate,
      LgTemplateSamples.generateChoices(designerId1) as LgTemplate,
      LgTemplateSamples.choice(designerId1) as LgTemplate,
      LgTemplateSamples.SendActivityForOnChooseIntent(designerId2) as LgTemplate,
    ];

    await createLgTemplates({ id: lgFile.id, templates: lgTemplates, projectId });
  }
  return {
    id: newDialog.id,
    projectId,
    content: newDialog.content,
  };
};

export const triggerDispatcher = () => {
  const createTrigger = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (
      projectId: string,
      dialogId: string,
      formData: TriggerFormData,
      autoSelected = true
    ) => {
      try {
        const { snapshot } = callbackHelpers;
        const dispatcher = await snapshot.getPromise(dispatcherState);
        const { createLuIntent, createLgTemplates, updateDialog, selectTo } = dispatcher;
        const dialogPayload = await getNewDialogWithTrigger(
          callbackHelpers,
          projectId,
          dialogId,
          formData,
          createLuIntent,
          createLgTemplates
        );
        await updateDialog(dialogPayload);
        if (autoSelected) {
          const index = get(dialogPayload.content, 'triggers', []).length - 1;
          await selectTo(projectId, dialogPayload.id, `triggers[${index}]`);
        }
      } catch (ex) {
        setError(callbackHelpers, ex);
      }
    }
  );

  const deleteTrigger = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (projectId: string, dialogId: string, trigger: ITriggerCondition) => {
      try {
        const { snapshot } = callbackHelpers;
        const dispatcher = await snapshot.getPromise(dispatcherState);
        const locale = await snapshot.getPromise(localeState(projectId));
        const luFiles = await snapshot.getPromise(luFilesSelectorFamily(projectId));
        const luFile = luFiles.find((file) => file.id === `${dialogId}.${locale}`);

        const { removeLuIntent, removeLgTemplates } = dispatcher;

        if (trigger.$kind === SDKKinds.OnIntent) {
          const intentName = trigger.intent as string;
          luFile && removeLuIntent({ id: luFile.id, intentName, projectId });
        }

        // Clean action resources
        const actions = trigger.actions as BaseSchema[];
        if (!actions || !Array.isArray(actions)) return;

        luFile &&
          deleteActions(
            actions,
            (templateNames: string[]) => removeLgTemplates({ id: `${dialogId}.${locale}`, templateNames, projectId }),
            (intentNames: string[]) =>
              Promise.all(intentNames.map((intentName) => removeLuIntent({ id: luFile.id, intentName, projectId })))
          );
      } catch (ex) {
        setError(callbackHelpers, ex);
      }
    }
  );

  const createQnATrigger = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (
      projectId: string,
      dialogId: string,
      autoSelectTrigger?: boolean
    ) => {
      try {
        const { snapshot } = callbackHelpers;
        const dispatcher = await snapshot.getPromise(dispatcherState);
        const dialogs = await snapshot.getPromise(dialogsSelectorFamily(projectId));

        const targetDialog = dialogs.find((item) => item.id === dialogId);
        if (!targetDialog) throw new Error(`dialog ${dialogId} not found`);
        const existedQnATrigger = get(targetDialog, 'content.triggers', []).find(
          (item) => item.$kind === SDKKinds.OnQnAMatch
        );
        if (!existedQnATrigger) {
          await dispatcher.createTrigger(projectId, dialogId, defaultQnATriggerData, autoSelectTrigger);
        }
      } catch (ex) {
        setError(callbackHelpers, ex);
      }
    }
  );

  const createTriggerForRemoteSkill = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (
      projectId: string,
      dialogId: string,
      formData: TriggerFormData,
      skillId: string,
      autoSelected = true
    ) => {
      try {
        const { snapshot } = callbackHelpers;
        const { createLuIntent, createLgTemplates, updateDialog, selectTo } = await snapshot.getPromise(
          dispatcherState
        );
        const dialogPayload = await getNewDialogWithTrigger(
          callbackHelpers,
          projectId,
          dialogId,
          formData,
          createLuIntent,
          createLgTemplates
        );
        const index = get(dialogPayload.content, 'triggers', []).length - 1;
        const skillsByProjectId = await snapshot.getPromise(skillNameIdentifierByProjectIdSelector);
        const skillIdentifier = skillsByProjectId[skillId];
        const actions: any = [];
        actions.push(createActionFromManifest(skillIdentifier));
        dialogPayload.content.triggers[index].actions = actions;

        await updateDialog(dialogPayload);
        if (autoSelected) {
          await selectTo(projectId, dialogPayload.id, `triggers[${index}]`);
        }
      } catch (ex) {
        setError(callbackHelpers, ex);
      }
    }
  );
  return {
    createTrigger,
    deleteTrigger,
    createQnATrigger,
    createTriggerForRemoteSkill,
  };
};
