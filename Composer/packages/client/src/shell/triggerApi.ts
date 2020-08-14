// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useEffect, useState } from 'react';
import { LuFile, LgFile, DialogInfo, LgTemplateSamples } from '@bfc/shared';
import { useRecoilValue } from 'recoil';
import { LgTemplate } from '@bfc/shared';
import get from 'lodash/get';

import { useResolvers } from '../hooks/useResolver';
import { projectIdState, schemasState, dialogsState, localeState, lgFilesState } from '../recoilModel/atoms';
import { onChooseIntentKey, generateNewDialog, intentTypeKey, qnaMatcherKey } from '../utils/dialogUtil';
import { navigateTo } from '../utils/navigation';

import { dispatcherState } from './../recoilModel/DispatcherWrapper';

function createTriggerApi(
  state: { projectId; schemas; dialogs; locale; lgFiles },
  dispatchers: any, //TODO
  luFileResolver: (id: string) => LuFile | undefined,
  lgFileResolver: (id: string) => LgFile | undefined,
  dialogResolver: (id: string) => DialogInfo | undefined
) {
  const getDesignerIdFromDialogPath = (dialog, path) => {
    const value = get(dialog, path, '');
    const startIndex = value.lastIndexOf('_');
    const endIndex = value.indexOf('()');
    return value.substring(startIndex + 1, endIndex);
  };

  const createTriggerHandler = async (id, formData, url) => {
    const luFile = luFileResolver(id);
    const lgFile = lgFileResolver(id);
    const dialog = dialogResolver(id);
    const { createLuIntent, createLgTemplates, updateDialog, selectTo } = dispatchers;
    const { projectId, schemas, dialogs, locale, lgFiles } = state;
    if (!luFile) throw new Error(`lu file ${id} not found`);
    if (!lgFile) throw new Error(`lg file ${id} not found`);
    if (!dialog) throw new Error(`dialog ${id} not found`);
    const newDialog = generateNewDialog(dialogs, dialog.id, formData, schemas.sdk?.content);
    const index = get(newDialog, 'content.triggers', []).length - 1;
    if (formData.$kind === intentTypeKey && formData.triggerPhrases) {
      const intent = { Name: formData.intent, Body: formData.triggerPhrases };
      luFile && createLuIntent({ id: luFile.id, intent, projectId });
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
      await createLgTemplates({ id: lgFile.id, templates: lgTemplates });
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

      await createLgTemplates({ id: `common.${locale}`, templates: lgTemplates2 });
      await createLgTemplates({ id: lgFile.id, templates: lgTemplates1 });
    }
    const dialogPayload = {
      id: newDialog.id,
      projectId,
      content: newDialog.content,
    };
    await updateDialog(dialogPayload);
    if (url) {
      navigateTo(url);
    } else {
      selectTo(`triggers[${index}]`);
    }
  };
  return {
    createTrigger: createTriggerHandler,
  };
}

export function useTriggerApi() {
  const projectId = useRecoilValue(projectIdState);
  const schemas = useRecoilValue(schemasState);
  const dialogs = useRecoilValue(dialogsState);
  const locale = useRecoilValue(localeState);
  const lgFiles = useRecoilValue(lgFilesState);
  const dispatchers = useRecoilValue(dispatcherState);
  const { luFileResolver, lgFileResolver, dialogResolver } = useResolvers();
  const [api, setApi] = useState(
    createTriggerApi(
      { projectId, schemas, dialogs, locale, lgFiles },
      dispatchers,
      luFileResolver,
      lgFileResolver,
      dialogResolver
    )
  );

  useEffect(() => {
    const newApi = createTriggerApi(
      { projectId, schemas, dialogs, locale, lgFiles },
      dispatchers,
      luFileResolver,
      lgFileResolver,
      dialogResolver
    );
    setApi(newApi);
    return () => {
      Object.keys(newApi).forEach((apiName) => {
        if (typeof newApi[apiName].flush === 'function') {
          newApi[apiName].flush();
        }
      });
    };
  }, [projectId, schemas, dialogs, locale, lgFiles]);

  return api;
}
