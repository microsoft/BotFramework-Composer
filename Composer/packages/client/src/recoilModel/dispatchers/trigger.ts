// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */
import { useRecoilCallback, CallbackInterface } from 'recoil';
import { BaseSchema, deleteActions, ITriggerCondition, LgTemplate, LgTemplateSamples, SDKKinds } from '@bfc/shared';
import get from 'lodash/get';

import { luFilesState, schemasState, dialogState, localeState } from '../atoms/botState';
import { dialogsSelectorFamily } from '../selectors';
import {
  onChooseIntentKey,
  generateNewDialog,
  intentTypeKey,
  qnaMatcherKey,
  TriggerFormData,
} from '../../utils/dialogUtil';
import { lgFilesSelectorFamily } from '../selectors/lg';
import { dispatcherState } from '../atoms';

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
        const lgFiles = await snapshot.getPromise(lgFilesSelectorFamily(projectId));
        const luFiles = await snapshot.getPromise(luFilesState(projectId));
        const dialogs = await snapshot.getPromise(dialogsSelectorFamily(projectId));
        const dialog = await snapshot.getPromise(dialogState({ projectId, dialogId }));
        const schemas = await snapshot.getPromise(schemasState(projectId));
        const locale = await snapshot.getPromise(localeState(projectId));

        const { createLuIntent, createLgTemplates, updateDialog, selectTo } = dispatcher;

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
          const designerId1 = getDesignerIdFromDialogPath(newDialog, `content.triggers[${index}].actions[4].prompt`);
          const designerId2 = getDesignerIdFromDialogPath(
            newDialog,
            `content.triggers[${index}].actions[5].elseActions[0].activity`
          );
          const lgTemplates1: LgTemplate[] = [
            LgTemplateSamples.TextInputPromptForOnChooseIntent(designerId1) as LgTemplate,
            LgTemplateSamples.SendActivityForOnChooseIntent(designerId2) as LgTemplate,
          ];

          let lgTemplates2: LgTemplate[] = [
            LgTemplateSamples.adaptiveCardJson as LgTemplate,
            LgTemplateSamples.whichOneDidYouMean as LgTemplate,
            LgTemplateSamples.pickOne as LgTemplate,
            LgTemplateSamples.getAnswerReadBack as LgTemplate,
            LgTemplateSamples.getIntentReadBack as LgTemplate,
          ];
          const commonlgFile = lgFiles.find(({ id }) => id === `common.${locale}`);

          lgTemplates2 = lgTemplates2.filter(
            (t) => commonlgFile?.templates.findIndex((clft) => clft.name === t.name) === -1
          );

          await createLgTemplates({ id: `common.${locale}`, templates: lgTemplates2, projectId });
          await createLgTemplates({ id: lgFile.id, templates: lgTemplates1, projectId });
        }
        const dialogPayload = {
          id: newDialog.id,
          projectId,
          content: newDialog.content,
        };
        await updateDialog(dialogPayload);
        if (autoSelected) {
          await selectTo(projectId, newDialog.id, `triggers[${index}]`);
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
        const luFiles = await snapshot.getPromise(luFilesState(projectId));
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
            (templateNames: string[]) => removeLgTemplates({ id: dialogId, templateNames, projectId }),
            (intentNames: string[]) =>
              Promise.all(intentNames.map((intentName) => removeLuIntent({ id: luFile.id, intentName, projectId })))
          );
      } catch (ex) {
        setError(callbackHelpers, ex);
      }
    }
  );

  const createQnATrigger = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (projectId: string, dialogId: string) => {
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
          await dispatcher.createTrigger(projectId, dialogId, defaultQnATriggerData);
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
  };
};
